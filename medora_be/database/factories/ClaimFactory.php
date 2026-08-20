<?php

namespace Database\Factories;

use App\Enums\ClaimStatus;
use App\Models\Claim;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Claim>
 */
class ClaimFactory extends Factory
{
    protected $model = Claim::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'text' => fake()->sentence(15),
            'is_claim' => true,
            'status' => ClaimStatus::ANALYZED,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ClaimStatus::PENDING,
        ]);
    }

    public function reviewNeeded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ClaimStatus::REVIEW_NEEDED,
        ]);
    }
}
