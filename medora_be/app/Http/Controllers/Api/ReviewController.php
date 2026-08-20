<?php

namespace App\Http\Controllers\Api;

use App\Enums\ClaimStatus;
use App\Http\Controllers\Controller;
use App\Models\Claim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function claims(Request $request): JsonResponse
    {
        return response()->json(
            Claim::where('status', ClaimStatus::REVIEW_NEEDED)
                ->with(['user', 'trustAssessment', 'claimEvidences.evidence'])
                ->orderByDesc('created_at')
                ->get()
        );
    }
}
