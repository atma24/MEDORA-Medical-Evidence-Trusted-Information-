<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Perluas enum status klaim (tambah REVIEW_NEEDED) + kolom verdict review
        Schema::table('claims', function (Blueprint $table) {
            $table->enum('status', ['PENDING', 'ANALYZED', 'REVIEW_NEEDED', 'REVIEWED'])
                ->default('PENDING')
                ->change();
            $table->enum('review_verdict', ['HOAX', 'FACT'])->nullable()->after('review_note');
        });

        // 2. Tambah trust_score + insufficient_count pada trust_assessments
        Schema::table('trust_assessments', function (Blueprint $table) {
            $table->float('trust_score')->default(0)->after('evidence_strength');
            $table->integer('insufficient_count')->default(0)->after('neutral_count');
        });
    }

    public function down(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->enum('status', ['PENDING', 'ANALYZED', 'REVIEWED'])
                ->default('PENDING')
                ->change();
            $table->dropColumn('review_verdict');
        });

        Schema::table('trust_assessments', function (Blueprint $table) {
            $table->dropColumn(['trust_score', 'insufficient_count']);
        });
    }
};
