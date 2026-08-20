<?php

namespace Database\Factories;

use App\Models\Speciality;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Speciality>
 */
class SpecialityFactory extends Factory
{
    protected $model = Speciality::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
        ];
    }
}
