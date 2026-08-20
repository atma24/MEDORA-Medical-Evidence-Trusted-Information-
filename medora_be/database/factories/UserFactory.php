<?php

namespace Database\Factories;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Models\Speciality;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => Role::USER,
            'provider' => 'email',
            'status' => ReviewerStatus::APPROVED,
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => Role::ADMIN,
        ]);
    }

    public function reviewer(?array $extra = []): static
    {
        return $this->state(fn (array $attributes) => array_merge([
            'role' => Role::REVIEWER,
            'str_number' => fake()->numerify('##################'),
            'speciality_id' => Speciality::factory(),
            'status' => ReviewerStatus::APPROVED,
        ], $extra));
    }

    public function reviewerPending(): static
    {
        return $this->reviewer(['status' => ReviewerStatus::PENDING]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
