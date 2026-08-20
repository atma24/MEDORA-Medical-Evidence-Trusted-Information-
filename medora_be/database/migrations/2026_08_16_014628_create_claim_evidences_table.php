<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('claim_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained('claims')->onDelete('cascade');
            $table->foreignId('evidence_id')->constrained('evidences')->onDelete('cascade');

            // Output ML #2
            $table->enum('relationship', ['SUPPORT', 'CONTRADICT', 'NEUTRAL', 'INSUFFICIENT']);
            $table->float('relevance_score')->nullable();
            $table->float('confidence')->nullable();

            // Mekanisme Human Review
            $table->enum('review_status', ['PENDING', 'CONFIRMED', 'REJECTED'])->default('PENDING');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('claim_evidences');
    }
};
