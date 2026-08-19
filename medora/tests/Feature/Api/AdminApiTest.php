<?php

namespace Tests\Feature\Api;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/admin/reviewers')
            ->assertForbidden();
    }

    public function test_admin_can_approve_and_reject_reviewers(): void
    {
        $reviewer = User::factory()->create([
            'role' => Role::REVIEWER,
            'status' => ReviewerStatus::PENDING,
        ]);

        $this->withToken($this->adminToken())
            ->postJson('/api/v1/admin/reviewers/'.$reviewer->id.'/approve')
            ->assertOk();

        $this->assertSame(ReviewerStatus::APPROVED, $reviewer->refresh()->status);

        $this->withToken($this->adminToken())
            ->postJson('/api/v1/admin/reviewers/'.$reviewer->id.'/reject')
            ->assertOk();

        $this->assertSame(ReviewerStatus::REJECTED, $reviewer->refresh()->status);
    }

    public function test_admin_can_manage_specialities(): void
    {
        $token = $this->adminToken();

        $response = $this->withToken($token)
            ->postJson('/api/v1/admin/specialities', ['name' => 'Radiologi'])
            ->assertCreated();

        $id = $response->json('id');

        $this->withToken($token)
            ->putJson('/api/v1/admin/specialities/'.$id, ['name' => 'Radiologi & Imaging'])
            ->assertOk();

        $this->assertDatabaseHas('specialities', ['id' => $id, 'name' => 'Radiologi & Imaging']);

        $this->withToken($token)
            ->deleteJson('/api/v1/admin/specialities/'.$id)
            ->assertOk();

        $this->assertDatabaseMissing('specialities', ['id' => $id]);
    }

    private function adminToken(): string
    {
        return User::factory()->create(['role' => Role::ADMIN])->createToken('api')->plainTextToken;
    }
}