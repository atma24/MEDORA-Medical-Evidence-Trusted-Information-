<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Enums\ReviewerStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReviewerApprovalController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            User::where('role', Role::REVIEWER)
                ->with('speciality')
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function approve(User $user): JsonResponse
    {
        abort_unless($user->role === Role::REVIEWER, 404);

        $user->update(['status' => ReviewerStatus::APPROVED]);

        return response()->json([
            'message' => 'Reviewer disetujui.',
            'user' => $user->fresh()->load('speciality'),
        ]);
    }

    public function reject(User $user): JsonResponse
    {
        abort_unless($user->role === Role::REVIEWER, 404);

        $user->update(['status' => ReviewerStatus::REJECTED]);

        return response()->json([
            'message' => 'Reviewer ditolak.',
            'user' => $user->fresh()->load('speciality'),
        ]);
    }
}