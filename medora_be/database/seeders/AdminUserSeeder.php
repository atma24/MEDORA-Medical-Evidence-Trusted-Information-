<?php

namespace Database\Seeders;

use App\Enums\ReviewerStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@medora.com'],
            [
                'name' => 'reviewer1',
                'password' => Hash::make('password'),
                'role' => Role::REVIEWER,
                'provider' => 'email',
                'status' => ReviewerStatus::APPROVED,
                'email_verified_at' => now(),
            ]
        );
    }
}
