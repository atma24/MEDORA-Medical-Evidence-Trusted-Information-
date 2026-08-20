# MEDORA Backend API

_MEDORA (Medical Evidence & Trusted Information)_ — API untuk analisis klaim medis, pencarian bukti dari PubMed, penilaian kepercayaan, dan review oleh ahli.

## Tech Stack

- **Laravel 13** (+ Sanctum, Socialite)
- **PHP 8.3+**
- **MySQL / MariaDB**
- **Sanctum** (Personal Access Token auth)
- **Queue** (Database driver)

## Prasyarat

| Komponen | Keterangan |
|---|---|
| PHP >= 8.3 | Laravel 13 requirement |
| Composer | Dependency manager |
| MySQL / MariaDB | Database utama |
| ML Service (FastAPI) | `medora-ml` di port 8001 |

## Setup

```bash
# 1. Clone & masuk direktori
cd medora_be

# 2. Install dependencies
composer install

# 3. Konfigurasi environment
cp .env.example .env
# Edit .env: DB, Google OAuth, MEDORA_ML_URL, FRONTEND_URL, dll.

# 4. Generate app key (jika belum)
php artisan key:generate

# 5. Migrasi database
php artisan migrate

# 6. Seeder (admin user + specialities + sources)
php artisan db:seed

# 7. Jalankan server
php artisan serve --host=127.0.0.1 --port=8000

# 8. Jalankan queue worker (di terminal terpisah)
php artisan queue:work

# 9. Jalankan ML service (di terminal lain)
cd ../medora-ml
start.bat
```

## Environment (.env)

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db-medora
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=${APP_URL}/api/auth/google/callback

# ML Service
MEDORA_ML_URL=http://127.0.0.1:8001
```

## API Endpoints

### Auth (Public)

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/register` | Registrasi user/reviewer |
| POST | `/api/login` | Login email/password |
| GET | `/api/auth/google` | Google OAuth (return `{ url }`) |
| GET | `/api/auth/google/callback` | Google callback |
| POST | `/api/forgot-password` | Kirim email reset password |
| POST | `/api/reset-password` | Reset password |
| GET | `/api/email/verify/{id}/{hash}` | Verifikasi email |
| GET | `/api/specialities` | Daftar bidang keahlian (publik) |

### Authenticated (Bearer Token)

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| POST | `/api/logout` | All | Logout & revoke token |
| GET | `/api/me` | All | Profil user saat ini |
| POST | `/api/email/resend` | All | Kirim ulang verifikasi email |
| PUT | `/api/password` | All | Update password |
| DELETE | `/api/profile` | All | Hapus akun |
| GET | `/api/claims` | USER | History klaim |
| POST | `/api/claims` | USER | Submit klaim baru |
| GET | `/api/claims/{id}` | USER | Detail klaim |

### Reviewer

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| GET | `/api/review/claims` | REVIEWER | Queue klaim REVIEW_NEEDED |
| POST | `/api/claims/{id}/evidences/{ce}/review` | REVIEWER | Review per-evidence (CONFIRMED/REJECTED) |
| POST | `/api/claims/{id}/review` | REVIEWER | Final verdict (HOAX/FACT) + note |

### Admin

| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| GET | `/api/admin/reviewers/pending` | ADMIN | List reviewer PENDING |
| POST | `/api/admin/reviewers/{id}/approve` | ADMIN | Approve reviewer |
| POST | `/api/admin/reviewers/{id}/reject` | ADMIN | Reject reviewer |
| GET | `/api/admin/specialities` | ADMIN | Daftar specialities |
| POST | `/api/admin/specialities` | ADMIN | Tambah speciality |
| PUT | `/api/admin/specialities/{id}` | ADMIN | Edit speciality |
| DELETE | `/api/admin/specialities/{id}` | ADMIN | Hapus speciality |

## Response Format

Semua response dalam JSON:

```json
// Sukses
{ "token": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "USER" } }

// Error
{ "message": "Email atau password salah.", "errors": { "email": ["..."] } }
```

## Data Flow (Claim)

```
User submit claim (POST /api/claims)
       │
       ▼
Status: PENDING → AnalyzeClaimJob dispatched to queue
       │
       ▼
Job calls ML Service (POST /api/analyze-claim)
       │
       ├─ ML #1: Classification (is_claim, confidence)
       ├─ Evidences: PubMed search + ranking (up to 10)
       └─ Trust Assessment: evidence_strength, trust_score, needs_review
       │
       ▼
Status: ANALYZED (if trust >= 70 & !needs_review)
     or REVIEW_NEEDED (if trust < 70 || needs_review)
     or FAILED (if ML error)
       │
       ▼
Reviewer reviews per-evidence (CONFIRMED/REJECTED)
       │
       ▼
Reviewer submits final verdict (HOAX/FACT)
       │
       ▼
Status: REVIEWED
```

## Running Tests

```bash
# Semua test (menggunakan SQLite in-memory, tidak menyentuh DB utama)
php artisan test

# Test spesifik
php artisan test --filter=AuthTest
php artisan test --filter=ClaimTest
php artisan test --filter=AnalyzeClaimJobTest

# Code style
./vendor/bin/pint
```

## Seeder

```bash
php artisan db:seed
```

Seeder membuat:
- **Admin**: `admin@medora.com` / `password`
- **Specialities**: 6 bidang keahlian (Kedokteran Umum, Penyakit Dalam, dll.)
- **Source**: PubMed

---

_Dibangun dengan Laravel 13 · Sanctum · Socialite · MySQL · FastAPI_