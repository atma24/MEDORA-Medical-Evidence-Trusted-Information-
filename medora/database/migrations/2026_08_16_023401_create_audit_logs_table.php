<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // Contoh: "Changed review status"
            $table->string('target_type'); // Contoh: "ClaimEvidence"
            $table->bigInteger('target_id'); // ID dari data yang diubah
            $table->string('old_value')->nullable(); // Contoh: "PENDING"
            $table->string('new_value')->nullable(); // Contoh: "CONFIRMED"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
