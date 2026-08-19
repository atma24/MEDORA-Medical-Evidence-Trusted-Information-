<?php

namespace Tests\Feature\Auth;

use App\Enums\Role;
use App\Enums\ReviewerStatus;
use App\Models\Speciality;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => Role::USER->value,
            'status' => ReviewerStatus::APPROVED->value,
        ]);
    }

    public function test_reviewers_can_register_but_are_pending(): void
    {
        $speciality = Speciality::create(['name' => 'Penyakit Dalam']);

        $response = $this->postJson('/api/v1/auth/register', [
            'role' => Role::REVIEWER->value,
            'name' => 'Reviewer Baru',
            'email' => 'reviewer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'str_number' => '12011012123456',
            'speciality_id' => $speciality->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Registrasi berhasil. Akun Anda menunggu persetujuan admin.');

        $this->assertNull($response->json('token'));
        $this->assertDatabaseHas('users', [
            'email' => 'reviewer@example.com',
            'role' => Role::REVIEWER->value,
            'status' => ReviewerStatus::PENDING->value,
            'str_number' => '12011012123456',
            'speciality_id' => $speciality->id,
        ]);
    }

    public function test_reviewer_registration_validates_str_number_and_speciality(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'role' => Role::REVIEWER->value,
            'name' => 'Reviewer Baru',
            'email' => 'reviewer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['str_number', 'speciality_id']);
    }

    public function test_str_number_must_contain_exactly_fourteen_digits(): void
    {
        $speciality = Speciality::create(['name' => 'Penyakit Dalam']);

        $response = $this->postJson('/api/v1/auth/register', [
            'role' => Role::REVIEWER->value,
            'name' => 'Reviewer Baru',
            'email' => 'reviewer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'str_number' => '12345',
            'speciality_id' => $speciality->id,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['str_number']);
    }
}