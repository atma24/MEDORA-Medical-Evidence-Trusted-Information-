<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->enum('status', ['PENDING', 'ANALYZED', 'REVIEW_NEEDED', 'REVIEWED', 'FAILED'])
                ->default('PENDING')
                ->change();
        });

        Schema::table('claims', function (Blueprint $table) {
            $table->json('review_notes')->nullable()->change();
            $table->enum('review_verdict', ['HOAX', 'FACT'])->nullable()->after('review_notes');
            $table->timestamp('failed_at')->nullable()->after('review_verdict');
        });

        Schema::table('trust_assessments', function (Blueprint $table) {
            $table->float('trust_score')->default(0)->after('reliability_score');
            $table->integer('insufficient_count')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('trust_assessments', function (Blueprint $table) {
            $table->dropColumn(['trust_score', 'insufficient_count']);
        });

        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn(['review_notes', 'review_verdict', 'failed_at']);
            $table->enum('status', ['PENDING', 'REVIEWER_NEEDED'])
                ->default('PENDING')
                ->change();
        });
    }
};