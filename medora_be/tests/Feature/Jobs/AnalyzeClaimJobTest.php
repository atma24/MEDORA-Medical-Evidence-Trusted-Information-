<?php

namespace Tests\Feature\Jobs;

use App\Enums\ClaimStatus;
use App\Jobs\AnalyzeClaimJob;
use App\Models\Claim;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AnalyzeClaimJobTest extends TestCase
{
    use RefreshDatabase;

    private function mlPayload(bool $needsReview = false, float $evidenceStrength = 80): array
    {
        return [
            'analysis' => [
                'teks_asli' => 'Contoh klaim kesehatan.',
                'is_claim' => true,
                'confidence' => 92.5,
            ],
            'query' => 'contoh AND klaim',
            'source' => [
                'name' => 'PubMed',
                'type' => 'DATABASE',
                'tier' => 'Tier 1',
                'reliability_score' => 0.9,
                'url' => 'https://pubmed.ncbi.nlm.nih.gov/',
                'description' => 'Basis data biomedis.',
            ],
            'evidences' => [
                [
                    'pmid' => '12345678',
                    'doi' => '10.1000/xyz',
                    'title' => 'Studi tentang klaim kesehatan.',
                    'abstract' => 'Abstrak penelitian.',
                    'authors' => 'John Doe',
                    'publication_year' => 2023,
                    'url' => 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
                    'tier' => 'Science',
                    'relevance_score' => 0.85,
                    'relationship' => 'SUPPORT',
                    'confidence' => 95,
                ],
                [
                    'pmid' => '87654321',
                    'doi' => null,
                    'title' => 'Studi kedua.',
                    'abstract' => 'Abstrak kedua.',
                    'authors' => 'Jane Doe',
                    'publication_year' => 2022,
                    'url' => 'https://pubmed.ncbi.nlm.nih.gov/87654321/',
                    'tier' => 'Science',
                    'relevance_score' => 0.6,
                    'relationship' => 'NEUTRAL',
                    'confidence' => 88,
                ],
            ],
            'assessment' => [
                'evidence' => [
                    'total' => 2,
                    'supporting_count' => 1,
                    'contradicting_count' => 0,
                    'neutral_count' => 1,
                    'insufficient_count' => 0,
                ],
                'evidence_strength' => $evidenceStrength,
                'trust_score' => 80,
                'assessment' => 'Informasi terverifikasi',
                'needs_review' => $needsReview,
            ],
        ];
    }

    public function test_job_stores_full_pipeline_results_and_marks_analyzed(): void
    {
        Http::fake([
            config('services.medora_ml.url').'/api/analyze-claim' => Http::response($this->mlPayload()),
        ]);

        $user = User::factory()->create();
        $claim = Claim::factory()->pending()->for($user)->create();

        (new AnalyzeClaimJob($claim))->handle();

        $claim->refresh();

        $this->assertEquals(ClaimStatus::ANALYZED, $claim->status);
        $this->assertTrue($claim->is_claim);
        $this->assertEqualsWithDelta(0.925, $claim->ml_confidence, 0.001);

        $this->assertDatabaseCount('sources', 1);
        $this->assertDatabaseCount('evidences', 2);
        $this->assertDatabaseCount('claim_evidences', 2);

        $this->assertDatabaseHas('trust_assessments', [
            'claim_id' => $claim->id,
            'evidence_strength' => 80,
            'supporting_count' => 1,
            'neutral_count' => 1,
            'assessment' => 'Informasi terverifikasi',
        ]);

        $this->assertDatabaseHas('claim_evidences', [
            'claim_id' => $claim->id,
            'relationship' => 'SUPPORT',
            'review_status' => 'PENDING',
        ]);
    }

    public function test_job_marks_review_needed_when_trust_is_low(): void
    {
        Http::fake([
            config('services.medora_ml.url').'/api/analyze-claim' => Http::response(
                $this->mlPayload(needsReview: true, evidenceStrength: 40)
            ),
        ]);

        $user = User::factory()->create();
        $claim = Claim::factory()->pending()->for($user)->create();

        (new AnalyzeClaimJob($claim))->handle();

        $this->assertEquals(ClaimStatus::REVIEW_NEEDED, $claim->fresh()->status);
    }

    public function test_job_deduplicates_evidence_by_pmid(): void
    {
        Http::fake([
            config('services.medora_ml.url').'/api/analyze-claim' => Http::response($this->mlPayload()),
        ]);

        $user = User::factory()->create();

        $first = Claim::factory()->pending()->for($user)->create();
        (new AnalyzeClaimJob($first))->handle();

        $second = Claim::factory()->pending()->for($user)->create();
        (new AnalyzeClaimJob($second))->handle();

        $this->assertDatabaseCount('evidences', 2);
        $this->assertDatabaseCount('claim_evidences', 4);
    }

    public function test_job_marks_failed_when_ml_api_fails(): void
    {
        Http::fake([
            config('services.medora_ml.url').'/api/analyze-claim' => Http::response('Server Error', 500),
        ]);

        $user = User::factory()->create();
        $claim = Claim::factory()->pending()->for($user)->create();

        (new AnalyzeClaimJob($claim))->handle();

        $this->assertEquals(ClaimStatus::FAILED, $claim->fresh()->status);
    }
}
