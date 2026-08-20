<?php

namespace Database\Factories;

use App\Models\Source;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Source>
 */
class SourceFactory extends Factory
{
    protected $model = Source::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'type' => 'DATABASE',
            'tier' => 'Tier 1',
            'reliability_score' => fake()->randomFloat(2, 0.5, 1.0),
        ];
    }
}
