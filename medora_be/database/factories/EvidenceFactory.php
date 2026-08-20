<?php

namespace Database\Factories;

use App\Models\Evidence;
use App\Models\Source;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evidence>
 */
class EvidenceFactory extends Factory
{
    protected $model = Evidence::class;

    public function definition(): array
    {
        return [
            'source_id' => Source::factory(),
            'pmid' => (string) fake()->unique()->numerify('########'),
            'title' => fake()->sentence(8),
            'abstract' => fake()->paragraph(3),
            'authors' => fake()->name(),
            'publication_year' => (string) fake()->year(),
        ];
    }
}
