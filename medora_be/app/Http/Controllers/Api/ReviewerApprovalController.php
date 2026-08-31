<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewerApprovalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', Role::REVIEWER)->with('speciality')->orderByDesc('created_at');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%");
            });
        }
        return response()->json($query->paginate((int) $request->input('per_page', 15)));
    }

    public function pending(): JsonResponse
    {
        return response()->json(
            User::where('role', Role::REVIEWER)
                ->where('status', ReviewerStatus::PENDING)
                ->with('speciality')
                ->get()
        );
    }

    public function approve(User $user): JsonResponse
    {
        abort_unless($user->role === Role::REVIEWER, 404);
        abort_unless($user->status === ReviewerStatus::PENDING, 422, 'Reviewer sudah diproses.');

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
