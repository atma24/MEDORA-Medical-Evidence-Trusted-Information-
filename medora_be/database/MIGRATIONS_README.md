# Database Migration Files - MEDORA Backend

## Migrasi yang Telah Dikonsolidasi ke 6 File

### ✅ Struktur Final (6 File)

```
1. 2026_08_15_000000_create_core_tables.php
   ├── users table (core user data)
   ├── cache table (Laravel caching)
   └── jobs table (Laravel queue jobs)

2. 2026_08_16_000000_create_claims_and_evidence_system.php
   ├── sources (artikel/referensi berita)
   ├── claims (klaim hoaks/fakta)
   ├── evidences (bukti pendukung)
   ├── claim_evidences (pivot claims-evidences)
   ├── trust_assessments (penilaian kepercayaan klaim)
   └── audit_logs (log aktivitas sistem)

3. 2026_08_17_000001_add_provider_and_reviewer_fields_to_users_table.php
   * Socialite OAuth fields: provider, provider_id, avatar
   * Reviewer credentials: str_number, speciality_id, status

4. 2026_08_18_000000_create_laravel_system_tables.php
   ├── sessions (session management)
   ├── password_reset_tokens (forgot password tokens)
   └── personal_access_tokens (Laravel Sanctum API tokens)

5. 2026_08_18_000000_create_specialities_table.php
   └── Reference data medical specialties (Dokter Umum, PD, Bedah, dll)

6. 2026_08_19_000000_add_enhanced_claim_fields.php
   * Claims: enum status expanded (ANALYZED, REVIEW_NEEDED, REVIEWED, FAILED)
   * Claims: review_verdict (HOAX/FACT), failed_at timestamp
   * Trust assessments: trust_score, insufficient_count
```

---

## Cara Menjalankan Migration

```bash
# Fresh database (hapus semua dan create ulang)
php artisan migrate:fresh --seed

# Standard migration (tambah tabel baru)
php artisan migrate

# Rollback last migration step
php artisan migrate:rollback

# View migration status
php artisan migrate:status
```

### ⚠️ Catatan Penting

- Jika ada masalah saat migration, pastikan jalankan `php artisan migrate:fresh --seed` untuk reset database dari awal.
- Urutan file migration sudah diatur berdasarkan dependency (urutan eksekusi otomatis Laravel).