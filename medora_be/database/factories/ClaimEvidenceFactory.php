<?php

namespace Database\Factories;

use App\Models\Claim;
use App\Models\ClaimEvidence;
use App\Models\Evidence;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ClaimEvidence>
 */
class ClaimEvidenceFactory extends Factory
{
    protected $model = ClaimEvidence::class;

    public function definition(): array
    {
        return [
            'claim_id' => Claim::factory(),
            'evidence_id' => Evidence::factory(),
            'relationship' => fake()->randomElement(['SUPPORT', 'CONTRADICT', 'NEUTRAL', 'INSUFFICIENT']),
            'relevance_score' => fake()->randomFloat(4, 0, 1),
            'confidence' => fake()->randomFloat(2, 0, 100),
            'review_status' => 'PENDING',
        ];
    }
}
