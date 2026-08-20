<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trust_assessments', function (Blueprint $table) {
            $table->id();

            // Menjadikan relasinya strict 1:1, satu klaim hanya punya satu hasil assessment final
            $table->foreignId('claim_id')->unique()->constrained('claims')->onDelete('cascade');

            $table->float('evidence_strength')->default(0);
            $table->integer('supporting_count')->default(0);
            $table->integer('contradicting_count')->default(0);
            $table->integer('neutral_count')->default(0);
            $table->string('assessment');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trust_assessments');
    }
};
