<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('str_number')->nullable()->unique()->after('avatar');
            $table->foreignId('speciality_id')->nullable()->after('str_number')->constrained()->nullOnDelete();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('APPROVED')->after('speciality_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('speciality_id');
            $table->dropColumn(['str_number', 'status']);
        });
    }
};
