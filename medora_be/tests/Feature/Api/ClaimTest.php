<?php

namespace Tests\Feature\Api;

use App\Jobs\AnalyzeClaimJob;
use App\Models\Claim;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ClaimTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_claim_and_job_is_dispatched(): void
    {
        Queue::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/claims', [
                'text' => 'Minum air putih 8 gelas sehari dapat mencegah semua penyakit.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('claim.status', 'PENDING');

        $this->assertDatabaseHas('claims', [
            'user_id' => $user->id,
            'status' => 'PENDING',
        ]);

        Queue::assertPushed(AnalyzeClaimJob::class);
    }

    public function test_claim_text_is_required_and_max_5000(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/claims', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['text']);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/claims', ['text' => str_repeat('a', 5001)])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['text']);
    }

    public function test_user_can_list_own_claims(): void
    {
        $user = User::factory()->create();
        Claim::factory()->count(2)->for($user)->create();
        Claim::factory()->count(1)->create(); // klaim milik user lain

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/claims');

        $response->assertOk();
        $this->assertCount(2, $response->json());
    }

    public function test_user_can_view_own_claim_detail(): void
    {
        $user = User::factory()->create();
        $claim = Claim::factory()->for($user)->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/claims/'.$claim->id)
            ->assertOk()
            ->assertJsonPath('id', $claim->id);
    }

    public function test_user_cannot_view_others_claim(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $claim = Claim::factory()->for($owner)->create();

        $this->actingAs($other, 'sanctum')
            ->getJson('/api/claims/'.$claim->id)
            ->assertStatus(403);
    }

    public function test_admin_cannot_access_user_claim_endpoints(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/claims')
            ->assertStatus(403);
    }
}
