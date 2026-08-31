<?php

namespace App\Http\Controllers\Api;

use App\Enums\ClaimStatus;
use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeClaimJob;
use App\Models\Claim;
use App\Models\ClaimEvidence;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->claims()
                ->with(['trustAssessment', 'claimEvidences.evidence'])
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
{
    $request->validate([
        'text' => ['required', 'string', 'max:255'], // Ini Topiknya
        'detail' => ['required', 'string', 'max:5000'], // Ini Detailnya
    ]);

    $claim = $request->user()->claims()->create([
        'text' => $request->text,
        'detail' => $request->detail,
        'status' => ClaimStatus::PENDING,
    ]);

    AnalyzeClaimJob::dispatch($claim);

    return response()->json([
        'message' => 'Klaim sedang dianalisis.',
        'claim' => $claim,
    ], 201);
}

    public function show(Request $request, Claim $claim): JsonResponse
    {
        abort_unless(
            $request->user()->id === $claim->user_id || $request->user()->role === \App\Enums\Role::REVIEWER, 
            403,
            'Anda tidak memiliki akses ke klaim ini.'
        );

        return response()->json(
            $claim->load([
                'trustAssessment',
                'claimEvidences.evidence.source',
                'claimEvidences.reviewer',
                'reviewer',
            ])
        );
    }

    public function reviewEvidence(Request $request, Claim $claim, ClaimEvidence $claimEvidence): JsonResponse
    {
        abort_unless($claim->id === $claimEvidence->claim_id, 404);

        $request->validate([
            'status' => ['required', 'in:CONFIRMED,REJECTED'],
        ]);

        $claimEvidence->update([
            'review_status' => $request->status,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Review evidence berhasil disimpan.',
            'claim_evidence' => $claimEvidence->fresh()->load('evidence'),
        ]);
    }

    public function review(Request $request, Claim $claim): JsonResponse
    {
        abort_unless($claim->status === ClaimStatus::REVIEW_NEEDED, 422, 'Klaim ini tidak memerlukan review.');

        $request->validate([
            'verdict' => ['required', 'in:HOAX,FACT'],
            'note' => ['nullable', 'string', 'max:5000'],
        ]);

        $claim->update([
            'status' => ClaimStatus::REVIEWED,
            'reviewed_by' => $request->user()->id,
            'review_note' => $request->note,
            'review_verdict' => $request->verdict,
        ]);

        return response()->json([
            'message' => 'Review klaim berhasil disimpan.',
            'claim' => $claim->fresh()->load(['trustAssessment', 'claimEvidences.evidence', 'reviewer']),
        ]);
    }

    public function destroy(Request $request, Claim $claim): JsonResponse
    {
        abort_unless(
            $request->user()->id === $claim->user_id,
            403,
            'Anda tidak memiliki akses untuk menghapus klaim ini.'
        );

        $claim->delete();

        return response()->json(['message' => 'Klaim berhasil dihapus.']);
    }
}
