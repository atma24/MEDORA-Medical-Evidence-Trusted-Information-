<?php

namespace Tests\Feature\Api;

use App\Enums\ClaimStatus;
use App\Models\Claim;
use App\Models\ClaimEvidence;
use App\Models\Evidence;
use App\Models\Source;
use App\Models\TrustAssessment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private function makeReviewNeededClaim(): array
    {
        $user = User::factory()->create();
        $reviewer = User::factory()->reviewer()->create();

        $claim = Claim::factory()->reviewNeeded()->for($user)->create();

        $source = Source::factory()->create(['name' => 'PubMed']);

        $evidences = collect(range(1, 2))->map(function () use ($source) {
            return Evidence::factory()->for($source)->create();
        });

        $claimEvidences = $evidences->map(function ($evidence) use ($claim) {
            return ClaimEvidence::factory()->create([
                'claim_id' => $claim->id,
                'evidence_id' => $evidence->id,
                'relationship' => 'CONTRADICT',
            ]);
        });

        TrustAssessment::factory()->create([
            'claim_id' => $claim->id,
            'evidence_strength' => 40,
            'trust_score' => 40,
            'assessment' => 'Misinformasi',
        ]);

        return [$user, $reviewer, $claim, $claimEvidences];
    }

    public function test_reviewer_can_list_review_queue(): void
    {
        [$user, $reviewer, $claim, $claimEvidences] = $this->makeReviewNeededClaim();

        // Buat klaim ANALYZED yang TIDAK boleh muncul di queue
        Claim::factory()->for($user)->create();

        $response = $this->actingAs($reviewer, 'sanctum')
            ->getJson('/api/review/claims');

        $response->assertOk();
        $this->assertCount(1, $response->json());
        $this->assertEquals($claim->id, $response->json()[0]['id']);
    }

    public function test_reviewer_can_review_each_evidence(): void
    {
        [$user, $reviewer, $claim, $claimEvidences] = $this->makeReviewNeededClaim();
        $ce = $claimEvidences->first();

        $this->actingAs($reviewer, 'sanctum')
            ->postJson("/api/claims/{$claim->id}/evidences/{$ce->id}/review", [
                'status' => 'CONFIRMED',
            ])
            ->assertOk()
            ->assertJsonPath('claim_evidence.review_status', 'CONFIRMED')
            ->assertJsonPath('claim_evidence.reviewed_by', $reviewer->id);

        $this->assertDatabaseHas('claim_evidences', [
            'id' => $ce->id,
            'review_status' => 'CONFIRMED',
            'reviewed_by' => $reviewer->id,
        ]);
    }

    public function test_evidence_review_requires_valid_status(): void
    {
        [$user, $reviewer, $claim, $claimEvidences] = $this->makeReviewNeededClaim();
        $ce = $claimEvidences->first();

        $this->actingAs($reviewer, 'sanctum')
            ->postJson("/api/claims/{$claim->id}/evidences/{$ce->id}/review", [
                'status' => 'INVALID',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_reviewer_can_submit_final_verdict(): void
    {
        [$user, $reviewer, $claim, $claimEvidences] = $this->makeReviewNeededClaim();

        $this->actingAs($reviewer, 'sanctum')
            ->postJson("/api/claims/{$claim->id}/review", [
                'verdict' => 'HOAX',
                'note' => 'Klaim tidak didukung literatur.',
            ])
            ->assertOk()
            ->assertJsonPath('claim.status', ClaimStatus::REVIEWED->value)
            ->assertJsonPath('claim.review_verdict', 'HOAX')
            ->assertJsonPath('claim.reviewed_by', $reviewer->id)
            ->assertJsonPath('claim.review_note', 'Klaim tidak didukung literatur.');

        $this->assertDatabaseHas('claims', [
            'id' => $claim->id,
            'status' => ClaimStatus::REVIEWED->value,
            'review_verdict' => 'HOAX',
            'reviewed_by' => $reviewer->id,
        ]);
    }

    public function test_cannot_review_claim_that_is_not_review_needed(): void
    {
        $reviewer = User::factory()->reviewer()->create();
        $claim = Claim::factory()->for(User::factory()->create())->create();

        $this->actingAs($reviewer, 'sanctum')
            ->postJson("/api/claims/{$claim->id}/review", [
                'verdict' => 'FACT',
            ])
            ->assertStatus(422);
    }

    public function test_user_cannot_access_review_endpoints(): void
    {
        [$user, $reviewer, $claim, $claimEvidences] = $this->makeReviewNeededClaim();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/review/claims')
            ->assertStatus(403);
    }
}
