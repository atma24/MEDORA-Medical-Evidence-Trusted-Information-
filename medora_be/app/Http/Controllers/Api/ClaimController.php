<?php

namespace App\Http\Controllers\Api;

use App\Enums\ClaimStatus;
use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeClaimJob;
use App\Models\Claim;
use App\Models\ClaimEvidence;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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

    public function downloadPdf(Request $request, Claim $claim)
    {
        $user = $request->user();
        // Owner atau REVIEWER/ADMIN boleh download; USER lain ditolak
        $isOwner = $user->id === $claim->user_id;
        $isReviewer = $user->role === \App\Enums\Role::REVIEWER;
        $isAdmin = $user->role === \App\Enums\Role::ADMIN;
        abort_unless($isOwner || $isReviewer || $isAdmin, 403, 'Anda tidak memiliki akses untuk mengunduh PDF klaim ini.');

        $claim->load(['trustAssessment', 'claimEvidences.evidence.source', 'reviewer.speciality']);

        $trustAssessment = $claim->trustAssessment;
        $isReviewed = $claim->status === ClaimStatus::REVIEWED;
        $isAnalyzed = $claim->status === ClaimStatus::ANALYZED;
        $isAutoTervalidasi = $isAnalyzed && (($trustAssessment?->assessment === 'Terverifikasi') || (($trustAssessment?->trust_score ?? 0) > 75));
        $isAutoKeliru = $isAnalyzed && ($trustAssessment?->assessment === 'Misinformasi');
        $isAuto = $isAutoTervalidasi || $isAutoKeliru;

        // Banner config sama dengan FE: detail + ML — penjelasan detail pakar + ML digabung
        $mlSummary = $trustAssessment ? "ML Assessment: {$trustAssessment->assessment} (Trust ".number_format($trustAssessment->trust_score,0)."%, Evidence ".number_format($trustAssessment->evidence_strength,0)."%)" : null;
        if (($isReviewed && $claim->review_verdict === 'FACT') || $isAutoTervalidasi) {
            $title = ($trustAssessment?->assessment === 'Tervalidasi dengan Catatan') ? 'TERVALIDASI DENGAN CATATAN' : ($isAutoTervalidasi ? 'TERVALIDASI OTOMATIS OLEH SISTEM' : 'TERVALIDASI SEPENUHNYA');
            $type = $isAutoTervalidasi ? 'auto' : 'fact';
            $desc = $claim->review_note ?? $mlSummary ?? ($isAutoTervalidasi ? "Klaim ini tervalidasi otomatis oleh sistem MEDORA dengan trust score ".number_format($trustAssessment?->trust_score ?? 0,0)."% berdasarkan bukti jurnal terpercaya." : 'Klaim ini telah ditinjau dan divalidasi oleh pakar medis berdasarkan bukti literatur klinis yang valid.');
            if ($claim->review_note && $mlSummary) $desc = "Penjelasan Pakar: {$claim->review_note}\n\n{$mlSummary}";
        } elseif (($isReviewed && $claim->review_verdict === 'HOAX') || $isAutoKeliru) {
            $title = 'KELIRU (DISINFORMASI MEDIS)';
            $type = 'hoax';
            $desc = $claim->review_note ?? $mlSummary ?? 'Klaim ini dinilai keliru atau tidak terbukti secara medis berdasarkan peninjauan literatur klinis dan analisis pakar.';
            if ($claim->review_note && $mlSummary) $desc = "Penjelasan Pakar: {$claim->review_note}\n\n{$mlSummary}";
        } else {
            $title = 'MENUNGGU TINJAUAN PAKAR';
            $type = 'pending';
            $desc = $claim->review_note ?? $mlSummary ?? 'Klaim Anda sedang dalam proses analisis dan menunggu verifikasi manual dari tim dokter spesialis.';
            if ($claim->review_note && $mlSummary) $desc = "{$claim->review_note}\n\n{$mlSummary}";
        }

        $data = [
            'claim' => $claim,
            'trustAssessment' => $trustAssessment,
            'isAuto' => $isAuto,
            'banner' => ['title' => $title, 'desc' => $desc, 'type' => $type],
            'generatedAt' => now()->translatedFormat('d M Y H:i'),
            'createdAt' => $claim->created_at?->translatedFormat('d M Y'),
            'verifiedAt' => $claim->updated_at?->translatedFormat('d M Y'),
        ];

        $pdf = Pdf::loadView('claims.pdf', $data)->setPaper('a4', 'portrait');
        $filename = 'MEDORA-CLM-'.$claim->id.'-'.Str::slug(Str::limit($claim->text, 30)).'.pdf';

        return $pdf->download($filename);
    }
}
