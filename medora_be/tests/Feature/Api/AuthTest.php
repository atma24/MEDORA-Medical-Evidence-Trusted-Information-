<?php

namespace Tests\Feature\Api;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Models\Speciality;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Speciality::factory()->create(['name' => 'Kedokteran Umum']);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'User Baru',
            'email' => 'user@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', Role::USER->value)
            ->assertJsonPath('user.status', ReviewerStatus::APPROVED->value)
            ->assertJsonMissingPath('user.password');

        $this->assertDatabaseHas('users', [
            'email' => 'user@example.com',
            'role' => Role::USER->value,
        ]);
    }

    public function test_reviewer_register_requires_str_and_speciality(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Dr. Sari',
            'email' => 'sari@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'REVIEWER',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['str_number', 'speciality_id']);
    }

    public function test_reviewer_can_register_with_pending_status(): void
    {
        $speciality = Speciality::first();

        $response = $this->postJson('/api/register', [
            'name' => 'Dr. Sari',
            'email' => 'sari@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'REVIEWER',
            'str_number' => '1234567890123456',
            'speciality_id' => $speciality->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', Role::REVIEWER->value)
            ->assertJsonPath('user.status', ReviewerStatus::PENDING->value)
            ->assertJsonPath('user.str_number', '1234567890123456')
            ->assertJsonPath('user.speciality_id', $speciality->id);

        $this->assertDatabaseHas('users', [
            'email' => 'sari@example.com',
            'status' => ReviewerStatus::PENDING->value,
        ]);
    }

    public function test_user_can_login_and_get_token(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'salah',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('email', $user->email);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeaders(['Authorization' => 'Bearer '.$token])
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }
}
