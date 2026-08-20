<?php

namespace Tests\Feature\Api;

use App\Enums\ReviewerStatus;
use App\Models\Speciality;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewerApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->speciality = Speciality::factory()->create(['name' => 'Penyakit Dalam']);
    }

    public function test_admin_can_list_pending_reviewers(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->reviewerPending()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/reviewers/pending');

        $response->assertOk();
        $this->assertCount(1, $response->json());
    }

    public function test_admin_can_approve_reviewer(): void
    {
        $admin = User::factory()->admin()->create();
        $reviewer = User::factory()->reviewerPending()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/reviewers/'.$reviewer->id.'/approve')
            ->assertOk()
            ->assertJsonPath('user.status', ReviewerStatus::APPROVED->value);

        $this->assertDatabaseHas('users', [
            'id' => $reviewer->id,
            'status' => ReviewerStatus::APPROVED->value,
        ]);
    }

    public function test_admin_can_reject_reviewer(): void
    {
        $admin = User::factory()->admin()->create();
        $reviewer = User::factory()->reviewerPending()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/reviewers/'.$reviewer->id.'/reject')
            ->assertOk()
            ->assertJsonPath('user.status', ReviewerStatus::REJECTED->value);
    }

    public function test_non_admin_cannot_approve_reviewer(): void
    {
        $user = User::factory()->create();
        $reviewer = User::factory()->reviewerPending()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/reviewers/'.$reviewer->id.'/approve')
            ->assertStatus(403);
    }

    public function test_guest_cannot_access_admin_endpoints(): void
    {
        $this->getJson('/api/admin/reviewers/pending')->assertStatus(401);
    }
}
