<?php

namespace Tests\Feature\Api;

use App\Enums\ClaimStatus;
use App\Jobs\AnalyzeClaimJob;
use App\Models\Claim;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ClaimApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_claims_require_authentication(): void
    {
        $this->getJson('/api/v1/claims')->assertUnauthorized();
        $this->postJson('/api/v1/claims', ['text' => 'test'])->assertUnauthorized();
    }

    public function test_user_can_submit_claim_and_job_is_dispatched(): void
    {
        Queue::fake();
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/claims', [
                'text' => 'Minum vitamin C setiap hari dapat mencegah flu.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('status', ClaimStatus::PENDING->value);

        $this->assertDatabaseHas('claims', [
            'user_id' => $user->id,
            'text' => 'Minum vitamin C setiap hari dapat mencegah flu.',
        ]);

        Queue::assertPushed(AnalyzeClaimJob::class);
    }

    public function test_claim_text_is_required(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/claims', ['text' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('text');
    }

    public function test_user_can_list_own_claims_only(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $mine = Claim::create(['user_id' => $user->id, 'text' => 'Klaim saya']);
        Claim::create(['user_id' => $other->id, 'text' => 'Klaim orang lain']);

        $response = $this->withToken($token)->getJson('/api/v1/claims');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $mine->id);
    }

    public function test_user_cannot_access_other_claim(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;
        $claim = Claim::create(['user_id' => $other->id, 'text' => 'Klaim orang lain']);

        $this->withToken($token)
            ->getJson('/api/v1/claims/'.$claim->id)
            ->assertForbidden();

        $this->withToken($token)
            ->deleteJson('/api/v1/claims/'.$claim->id)
            ->assertForbidden();
    }

    public function test_user_can_show_and_delete_own_claim(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;
        $claim = Claim::create(['user_id' => $user->id, 'text' => 'Klaim saya']);

        $this->withToken($token)
            ->getJson('/api/v1/claims/'.$claim->id)
            ->assertOk()
            ->assertJsonPath('text', 'Klaim saya');

        $this->withToken($token)
            ->deleteJson('/api/v1/claims/'.$claim->id)
            ->assertOk();

        $this->assertDatabaseMissing('claims', ['id' => $claim->id]);
    }

    public function test_analyze_claim_job_updates_claim_from_ml(): void
    {
        Http::fake([
            '*/api/predict' => Http::response([
                'prediksi' => 'true',
                'confidence' => 82.5,
            ]),
        ]);

        $user = User::factory()->create();
        $claim = Claim::create(['user_id' => $user->id, 'text' => 'Vitamin C dapat mencegah flu.']);

        (new AnalyzeClaimJob($claim))->handle();

        $claim->refresh();
        $this->assertTrue($claim->is_claim);
        $this->assertEqualsWithDelta(0.825, $claim->ml_confidence, 0.001);
        $this->assertSame(ClaimStatus::ANALYZED, $claim->status);
    }

    public function test_analyze_claim_job_keeps_pending_when_ml_is_down(): void
    {
        Http::fake([
            '*/api/predict' => Http::response('', 500),
        ]);

        $user = User::factory()->create();
        $claim = Claim::create(['user_id' => $user->id, 'text' => 'Vitamin C dapat mencegah flu.']);

        (new AnalyzeClaimJob($claim))->handle();

        $this->assertSame(ClaimStatus::PENDING, $claim->refresh()->status);
    }
}
