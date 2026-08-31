<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('speciality')->orderByDesc('created_at');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $perPage = (int) ($request->input('per_page', 15));
        $perPage = max(5, min(50, $perPage));

        return response()->json($query->paginate($perPage));
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['speciality'])->loadCount('claims'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        // Cegah admin mengubah dirinya sendiri menjadi non-admin tanpa konfirmasi? Tetap izinkan tapi cegah lockout ADMIN terakhir
        if ($user->id === $request->user()->id && $request->has('role') && $request->role !== Role::ADMIN->value) {
            $adminCount = User::where('role', Role::ADMIN)->count();
            if ($adminCount <= 1) {
                return response()->json(['message' => 'Tidak dapat mengubah role ADMIN terakhir.'], 422);
            }
        }

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', new Enum(Role::class)],
            'status' => ['sometimes', new Enum(ReviewerStatus::class)],
            'speciality_id' => ['sometimes', 'nullable', 'exists:specialities,id'],
            'str_number' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $user->update($request->only(['name', 'email', 'role', 'status', 'speciality_id', 'str_number']));

        return response()->json([
            'message' => 'Pengguna berhasil diperbarui.',
            'user' => $user->fresh()->load('speciality'),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri.'], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Pengguna berhasil dihapus permanen.']);
    }

    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $pendingReviewers = User::where('role', Role::REVIEWER)->where('status', ReviewerStatus::PENDING)->count();
        $pendingClaims = Claim::where('status', \App\Enums\ClaimStatus::REVIEW_NEEDED)->count();
        $claimsToday = Claim::whereDate('created_at', today())->count();
        $totalClaims = Claim::count();

        // Klaim per hari 7 hari terakhir untuk mini chart
        $perDay = Claim::selectRaw("DATE(created_at) as d, COUNT(*) as c")
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupByRaw("DATE(created_at)")
            ->pluck('c', 'd');

        $labels = [];
        $values = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = now()->subDays($i)->format('Y-m-d');
            $labels[] = now()->subDays($i)->format('d M');
            $values[] = (int) ($perDay[$d] ?? 0);
        }

        return response()->json([
            'total_users' => $totalUsers,
            'pending_reviewers' => $pendingReviewers,
            'pending_claims' => $pendingClaims,
            'claims_today' => $claimsToday,
            'total_claims' => $totalClaims,
            'per_day' => [
                'labels' => $labels,
                'values' => $values,
            ],
        ]);
    }
}
