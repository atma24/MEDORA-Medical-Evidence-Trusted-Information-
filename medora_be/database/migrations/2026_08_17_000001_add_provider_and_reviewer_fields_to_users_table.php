<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Provider fields untuk Socialite OAuth
            $table->string('password')->nullable()->change();
            $table->string('provider')->default('email')->after('remember_token');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('avatar')->nullable()->after('provider_id');
            
            // Reviewer-specific fields
            $table->string('str_number')->nullable()->unique()->after('avatar');
            $table->foreignId('speciality_id')->nullable()->after('str_number')->constrained()->nullOnDelete();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('APPROVED')->after('speciality_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop reviewer-specific fields first
            $table->dropConstrainedForeignId('speciality_id');
            $table->dropColumn(['str_number', 'status']);
            
            // Revert provider fields
            $table->string('password')->nullable(false)->change();
            $table->dropColumn(['provider', 'provider_id', 'avatar']);
        });
    }
};
