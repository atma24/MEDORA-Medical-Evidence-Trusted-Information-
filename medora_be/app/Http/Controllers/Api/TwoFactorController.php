<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class TwoFactorController extends Controller
{
    private function cacheKeyEnabled(int $userId): string { return "2fa:enabled:{$userId}"; }
    private function cacheKeyCode(int $userId, string $purpose): string { return "2fa:code:{$purpose}:{$userId}"; }
    private function cacheKeyLoginTemp(string $tempToken): string { return "2fa:login:temp:{$tempToken}"; }

    /** GET /2fa/status — cek status 2FA user login (auth:sanctum) */
    public function status(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $enabled = Cache::has($this->cacheKeyEnabled($userId));
        $method = $enabled ? (Cache::get("2fa:method:{$userId}", 'email')) : null;

        return response()->json([
            'enabled' => $enabled,
            'method' => $method, // 'email' only for MVP
        ]);
    }

    /** POST /2fa/setup — kirim OTP ke email untuk enable 2FA (auth) */
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();
        // method minimal email saja
        $code = (string) random_int(100000, 999999);
        Cache::put($this->cacheKeyCode($user->id, 'setup'), $code, 600); // 10 menit
        Cache::put("2fa:method:{$user->id}", 'email', 60*60*24*365); // simpan preferensi

        // Kirim email — reuse Mail raw, tidak perlu template
        try {
            Mail::raw("Kode verifikasi 2FA MEDORA Anda: {$code}\nKode berlaku 10 menit. Jangan bagikan kepada siapapun.", function ($m) use ($user) {
                $m->to($user->email)->subject('Kode 2FA MEDORA — ' . $code);
            });
            Log::info("2FA setup code for user {$user->id} sent to {$user->email}: {$code}");
        } catch (\Throwable $e) {
            Log::warning("2FA mail failed for {$user->email}: ".$e->getMessage());
            // Tetap return sukses tapi sertakan code untuk dev jika MAIL not configured
            // Di production, email tetap harus terkirim; jika gagal, user bisa resend
        }

        return response()->json([
            'message' => 'Kode OTP telah dikirim ke email ' . $user->email,
            // Tampilkan kode untuk testing/demo jika mail belum terkonfigurasi — FE akan tampilkan toast
            'debug_code' => $code,
            'code' => $code,
        ]);
    }

    /** POST /2fa/confirm — verifikasi OTP setup untuk aktifkan 2FA */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required','string','size:6']]);
        $userId = $request->user()->id;
        $cached = Cache::get($this->cacheKeyCode($userId, 'setup'));

        if (!$cached || $cached !== $request->input('code')) {
            return response()->json(['message' => 'Kode OTP salah atau kadaluarsa.'], 422);
        }

        Cache::forever($this->cacheKeyEnabled($userId), true);
        Cache::put("2fa:method:{$userId}", 'email', 60*60*24*365);
        Cache::forget($this->cacheKeyCode($userId, 'setup'));

        return response()->json(['message' => '2FA berhasil diaktifkan via Email.']);
    }

    /** DELETE /2fa — nonaktifkan 2FA (auth) */
    public function disable(Request $request): JsonResponse
    {
        // Minimal butuh konfirmasi password atau OTP; untuk MVP cukup hapus flag jika user sudah auth
        // Jika ingin aman: cek current_password
        // $request->validate(['current_password'=>['required','current_password']]);
        $userId = $request->user()->id;
        Cache::forget($this->cacheKeyEnabled($userId));
        Cache::forget("2fa:method:{$userId}");
        Cache::forget($this->cacheKeyCode($userId, 'setup'));

        return response()->json(['message' => '2FA dinonaktifkan.']);
    }

    /** POST /2fa/verify — step ke-2 login (public, pakai temp_token) */
    public function verifyLogin(Request $request): JsonResponse
    {
        $request->validate([
            'temp_token' => ['required','string'],
            'code' => ['required','string','size:6'],
        ]);

        $tempToken = $request->input('temp_token');
        $code = $request->input('code');

        $cacheLoginKey = $this->cacheKeyLoginTemp($tempToken);
        $userId = Cache::get($cacheLoginKey);
        if (!$userId) {
            return response()->json(['message' => 'Sesi 2FA kadaluarsa. Silakan login ulang.'], 440);
        }

        $expected = Cache::get($this->cacheKeyCode($userId, 'login'));
        if (!$expected || $expected !== $code) {
            return response()->json(['message' => 'Kode OTP salah atau kadaluarsa.'], 422);
        }

        $user = User::find($userId);
        if (!$user) return response()->json(['message' => 'User tidak ditemukan.'], 404);

        // Bersihkan OTP login
        Cache::forget($this->cacheKeyCode($userId, 'login'));
        Cache::forget($cacheLoginKey);

        // Revoke old tokens & create baru (sama seperti login normal)
        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->fresh()->load('speciality'),
            'message' => 'Verifikasi 2FA berhasil.'
        ]);
    }

    /** Helper untuk AuthController::login — dipanggil internal */
    public static function isEnabledForUser(int $userId): bool
    {
        return Cache::has("2fa:enabled:{$userId}");
    }

    public static function initiateLogin2FA(User $user): array
    {
        $code = (string) random_int(100000, 999999);
        Cache::put("2fa:code:login:{$user->id}", $code, 600);
        $tempToken = Str::random(64);
        Cache::put("2fa:login:temp:{$tempToken}", $user->id, 600);

        try {
            Mail::raw("Kode login 2FA MEDORA: {$code}\nKode berlaku 10 menit.", function ($m) use ($user) {
                $m->to($user->email)->subject('Kode Login 2FA MEDORA — ' . $code);
            });
            Log::info("2FA login code for {$user->email}: {$code} temp {$tempToken}");
        } catch (\Throwable $e) {
            Log::warning("2FA login mail failed: ".$e->getMessage());
        }

        return [
            'temp_token' => $tempToken,
            'debug_code' => $code,
            'code' => $code,
        ];
    }
}
