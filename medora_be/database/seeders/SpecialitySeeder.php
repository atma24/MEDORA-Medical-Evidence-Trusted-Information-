<?php

namespace Database\Seeders;

use App\Models\Speciality;
use Illuminate\Database\Seeder;

class SpecialitySeeder extends Seeder
{
    public function run(): void
    {
        $specialities = [
            'Kedokteran Umum',
            'Penyakit Dalam',
            'Bedah',
            'Pediatri',
            'Obstetri & Ginekologi',
            'Kedokteran Gigi',
        ];

        foreach ($specialities as $name) {
            Speciality::firstOrCreate(['name' => $name]);
        }
    }
}
