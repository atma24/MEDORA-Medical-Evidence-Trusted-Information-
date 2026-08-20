<?php

namespace Tests\Feature\Api;

use App\Models\Speciality;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpecialityTest extends TestCase
{
    use RefreshDatabase;

    public function test_specialities_are_publicly_listable(): void
    {
        Speciality::factory()->count(3)->create();

        $this->getJson('/api/specialities')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_admin_can_create_speciality(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/specialities', ['name' => 'Neurologi'])
            ->assertStatus(201)
            ->assertJsonPath('name', 'Neurologi');

        $this->assertDatabaseHas('specialities', ['name' => 'Neurologi']);
    }

    public function test_speciality_name_must_be_unique(): void
    {
        $admin = User::factory()->admin()->create();
        Speciality::factory()->create(['name' => 'Neurologi']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/specialities', ['name' => 'Neurologi'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_admin_can_update_speciality(): void
    {
        $admin = User::factory()->admin()->create();
        $speciality = Speciality::factory()->create(['name' => 'Neurologi']);

        $this->actingAs($admin, 'sanctum')
            ->putJson('/api/admin/specialities/'.$speciality->id, ['name' => 'Neurologi Klinis'])
            ->assertOk()
            ->assertJsonPath('name', 'Neurologi Klinis');
    }

    public function test_admin_can_delete_speciality(): void
    {
        $admin = User::factory()->admin()->create();
        $speciality = Speciality::factory()->create(['name' => 'Neurologi']);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson('/api/admin/specialities/'.$speciality->id)
            ->assertOk();

        $this->assertDatabaseMissing('specialities', ['id' => $speciality->id]);
    }

    public function test_non_admin_cannot_manage_specialities(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/admin/specialities', ['name' => 'Neurologi'])
            ->assertStatus(403);
    }
}
