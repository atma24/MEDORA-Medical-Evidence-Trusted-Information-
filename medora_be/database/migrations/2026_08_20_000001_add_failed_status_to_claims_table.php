<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Perluas enum status klaim (tambah FAILED) — kompatibel MariaDB & SQLite.
        if (DB::connection()->getDriverName() === 'sqlite') {
            // SQLite tidak mendukung ALTER COLUMN; rebuild tabel.
            Schema::table('claims', function (Blueprint $table) {
                $table->enum('status', ['PENDING', 'ANALYZED', 'REVIEW_NEEDED', 'REVIEWED', 'FAILED'])
                    ->default('PENDING')
                    ->change();
            });
        } else {
            DB::statement("ALTER TABLE claims MODIFY status ENUM('PENDING','ANALYZED','REVIEW_NEEDED','REVIEWED','FAILED') NOT NULL DEFAULT 'PENDING'");
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            Schema::table('claims', function (Blueprint $table) {
                $table->enum('status', ['PENDING', 'ANALYZED', 'REVIEW_NEEDED', 'REVIEWED'])
                    ->default('PENDING')
                    ->change();
            });
        } else {
            DB::statement("ALTER TABLE claims MODIFY status ENUM('PENDING','ANALYZED','REVIEW_NEEDED','REVIEWED') NOT NULL DEFAULT 'PENDING'");
        }
    }
};
