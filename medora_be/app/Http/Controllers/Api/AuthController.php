<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $isReviewer = $request->input('role') === 'REVIEWER';

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['sometimes', 'string', 'in:USER,REVIEWER'],
        ];

        if ($isReviewer) {
            $rules['str_number'] = ['required', 'string', 'max:255', 'unique:'.User::class];
            $rules['speciality_id'] = ['required', 'exists:specialities,id'];
        }

        $request->validate($rules);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $isReviewer ? Role::REVIEWER : Role::USER,
            'provider' => 'email',
            'status' => $isReviewer ? ReviewerStatus::PENDING : ReviewerStatus::APPROVED,
        ];

        if ($isReviewer) {
            $userData['str_number'] = $request->str_number;
            $userData['speciality_id'] = $request->speciality_id;
        }

        $user = User::create($userData);

        event(new Registered($user));

        $message = $isReviewer
            ? 'Akun reviewer berhasil dibuat. Silakan tunggu persetujuan admin.'
            : 'Registrasi berhasil. Silakan login.';

        return response()->json([
            'message' => $message,
            'user' => $user->fresh()->load('speciality'),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = Auth::user();

        // Revoke old tokens
        $user->tokens()->delete();

        return response()->json([
            'token' => $user->createToken('auth-token')->plainTextToken,
            'user' => $user->fresh()->load('speciality'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function googleRedirect(): JsonResponse
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('google');

        return response()->json([
            'url' => $provider->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    public function googleCallback(): JsonResponse|RedirectResponse
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('google');

        $googleUser = $provider->stateless()->user();

        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            abort_unless($user->role === Role::USER, 403, 'Google login hanya untuk user.');

            if ($user->provider === 'email') {
                $user->update([
                    'provider' => 'google',
                    'provider_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            }
        } else {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'password' => null,
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'role' => Role::USER,
            ]);

            event(new Registered($user));
        }

        $user->tokens()->delete();
        $token = $user->createToken('google')->plainTextToken;
        $userData = $user->fresh()->load('speciality');

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $redirectUrl = "{$frontendUrl}/auth/callback?token=" . urlencode($token) . "&user=" . urlencode(json_encode($userData));

        return redirect()->away($redirectUrl);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->load('speciality')
        );
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['message' => __($status)]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json(['message' => 'Password berhasil direset.']);
    }

    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        abort_unless(hash_equals((string) $hash, sha1($user->getEmailForVerification())), 403);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email berhasil diverifikasi.']);
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.']);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email verifikasi telah dikirim ulang.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Akun berhasil dihapus.']);
    }
}
