<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\ReviewerStatus;
use App\Models\Speciality;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Speciality::create(['name' => 'Kedokteran Umum']);
        $internal = Speciality::create(['name' => 'Penyakit Dalam']);
        Speciality::create(['name' => 'Bedah']);
        Speciality::create(['name' => 'Pediatri']);
        Speciality::create(['name' => 'Obstetri & Ginekologi']);
        Speciality::create(['name' => 'Kedokteran Gigi']);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => Role::USER,
        ]);

        User::factory()->create([
            'name' => 'Reviewer User',
            'email' => 'reviewer@example.com',
            'role' => Role::REVIEWER,
            'status' => ReviewerStatus::APPROVED,
            'str_number' => '12011012123456',
            'speciality_id' => $internal->id,
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => Role::ADMIN,
        ]);
    }
}
