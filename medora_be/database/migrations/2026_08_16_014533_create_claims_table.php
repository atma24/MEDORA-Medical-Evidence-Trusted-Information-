<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('text');

            // Output dari ML #1 (Claim Analyzer)
            $table->boolean('is_claim')->default(true);
            $table->string('category')->nullable();
            $table->string('subject')->nullable();
            $table->string('relation')->nullable();
            $table->string('object')->nullable();
            $table->float('ml_confidence')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claims');
    }
};
