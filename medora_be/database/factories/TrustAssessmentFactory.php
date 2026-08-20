<?php

namespace Database\Factories;

use App\Models\Claim;
use App\Models\TrustAssessment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrustAssessment>
 */
class TrustAssessmentFactory extends Factory
{
    protected $model = TrustAssessment::class;

    public function definition(): array
    {
        return [
            'claim_id' => Claim::factory(),
            'evidence_strength' => fake()->randomFloat(2, 0, 100),
            'trust_score' => fake()->randomFloat(2, 0, 100),
            'supporting_count' => fake()->numberBetween(0, 10),
            'contradicting_count' => fake()->numberBetween(0, 10),
            'neutral_count' => fake()->numberBetween(0, 10),
            'insufficient_count' => 0,
            'assessment' => fake()->sentence(),
        ];
    }
}
