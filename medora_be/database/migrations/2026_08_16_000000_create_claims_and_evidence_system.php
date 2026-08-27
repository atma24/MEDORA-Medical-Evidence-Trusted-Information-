<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('url')->unique();
            $table->text('content')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('claim_text');
            $table->enum('status', ['PENDING', 'REVIEWER_NEEDED'])->default('PENDING');
            $table->json('review_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_id')->constrained()->cascadeOnDelete();
            $table->text('excerpt')->nullable();
            $table->enum('strength', ['STRONG', 'MODERATE', 'WEAK', 'NONE'])->default('NONE');
            $table->timestamps();
        });

        Schema::create('claim_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evidence_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('trust_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained()->cascadeOnDelete();
            $table->float('reliability_score')->default(0);
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->morphs('subject');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('trust_assessments');
        Schema::dropIfExists('claim_evidences');
        Schema::dropIfExists('evidences');
        Schema::dropIfExists('claims');
        Schema::dropIfExists('sources');
    }
};