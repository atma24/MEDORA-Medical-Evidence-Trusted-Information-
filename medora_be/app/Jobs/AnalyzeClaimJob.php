<?php

namespace App\Jobs;

use App\Enums\ClaimStatus;
use App\Models\Claim;
use App\Models\ClaimEvidence;
use App\Models\Evidence;
use App\Models\Source;
use App\Models\TrustAssessment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class AnalyzeClaimJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Claim $claim) {}

    public function handle(): void
    {
        try {
            $teksKlaim = trim($this->claim->text.'. '.$this->claim->detail);

            $response = Http::timeout(config('services.medora_ml.timeout', 120))
                ->post(config('services.medora_ml.url').'/api/analyze-claim', [
                    'teks_klaim' => $teksKlaim,
                ]);

            if ($response->failed()) {
                throw new \Exception('ML API request failed: '.$response->body());
            }

            $data = $response->json();

            // 1. Update claim dengan hasil ML #1 (Claim Analyzer)
            $analysis = $data['analysis'] ?? [];
            $this->claim->update([
                'is_claim' => ($analysis['is_claim'] ?? false) === true,
                'ml_confidence' => isset($analysis['confidence']) ? (float) $analysis['confidence'] / 100 : null,
                'category' => $analysis['category'] ?? null,
                'subject' => $analysis['subject'] ?? null,
                'relation' => $analysis['relation'] ?? null,
                'object' => $analysis['object'] ?? null,
            ]);

            // 2. Dapatkan atau buat source — struktur ML: array dengan key 'name', 'type', dst.
            $sourceData = $data['source'] ?? [];
            $sourceName = is_array($sourceData) ? ($sourceData['name'] ?? 'PubMed') : (string) $sourceData;
            $source = Source::firstOrCreate(
                ['name' => $sourceName],
                [
                    'type' => is_array($sourceData) ? ($sourceData['type'] ?? 'DATABASE') : 'DATABASE',
                    'tier' => is_array($sourceData) ? ($sourceData['tier'] ?? null) : null,
                    'reliability_score' => is_array($sourceData) ? (float) ($sourceData['reliability_score'] ?? 0.9) : 0.9,
                    'url' => is_array($sourceData) ? ($sourceData['url'] ?? null) : null,
                    'description' => is_array($sourceData) ? ($sourceData['description'] ?? null) : null,
                ]
            );

            // 3. Simpan evidences + claim_evidences
            $evidences = $data['evidences'] ?? [];
            foreach ($evidences as $ev) {
                $pmid = $ev['pmid'] ?? null;

                $evidence = $pmid
                    ? Evidence::where('pmid', $pmid)->first()
                    : null;

                if (! $evidence) {
                    $evidence = Evidence::create([
                        'source_id' => $source->id,
                        'pmid' => $pmid,
                        'doi' => $ev['doi'] ?? null,
                        'title' => $ev['title'] ?? 'Untitled',
                        'abstract' => $ev['abstract'] ?? null,
                        'authors' => $ev['authors'] ?? null,
                        'publication_year' => $ev['publication_year'] ?? null,
                        'url' => $ev['url'] ?? null,
                        'evidence_level' => $ev['tier'] ?? null,
                    ]);
                }

                ClaimEvidence::create([
                    'claim_id' => $this->claim->id,
                    'evidence_id' => $evidence->id,
                    'relationship' => strtoupper($ev['relationship'] ?? 'INSUFFICIENT'),
                    'relevance_score' => (float) ($ev['relevance_score'] ?? 0),
                    'confidence' => (float) ($ev['confidence'] ?? 0),
                    'review_status' => 'PENDING',
                ]);
            }

            // 4. Simpan trust_assessment
            // Struktur: assessment.evidence berisi count (bukan assessment.counts)
            $assessment = $data['assessment'] ?? [];
            $evidenceCounts = $assessment['evidence'] ?? [];
            $countMapping = [
                'supporting_count' => $evidenceCounts['supporting_count'] ?? $evidenceCounts['supporting'] ?? 0,
                'contradicting_count' => $evidenceCounts['contradicting_count'] ?? $evidenceCounts['contradicting'] ?? 0,
                'neutral_count' => $evidenceCounts['neutral_count'] ?? $evidenceCounts['neutral'] ?? 0,
                'insufficient_count' => $evidenceCounts['insufficient_count'] ?? $evidenceCounts['insufficient'] ?? 0,
            ];

            TrustAssessment::create([
                'claim_id' => $this->claim->id,
                'evidence_strength' => (float) ($assessment['evidence_strength'] ?? 0),
                'trust_score' => (float) ($assessment['trust_score'] ?? 0),
                'supporting_count' => (int) $countMapping['supporting_count'],
                'contradicting_count' => (int) $countMapping['contradicting_count'],
                'neutral_count' => (int) $countMapping['neutral_count'],
                'insufficient_count' => (int) $countMapping['insufficient_count'],
                'assessment' => $assessment['assessment'] ?? 'Tidak ada informasi',
            ]);

            // 5. Semua klaim WAJIB lewat review ahli sebelum dinyatakan final.
            // ML hanya memberi rekomendasi (trust_score + assessment), keputusan
            // akhir HOAX/FACT tetap di tangan reviewer. Tidak ada auto-valid.
            $newStatus = ClaimStatus::REVIEW_NEEDED;

            $this->claim->update(['status' => $newStatus]);

        } catch (\Throwable $e) {
            report($e);
            $this->claim->update(['status' => ClaimStatus::FAILED]);
        }
    }
}
