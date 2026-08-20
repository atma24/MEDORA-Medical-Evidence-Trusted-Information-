# 🚀 MEDORA — Panduan Setup Lengkap (Dari Nol di Laptop Baru)

Panduan ini untuk menyiapkan aplikasi MEDORA di laptop baru **dari nol**, mulai dari
clone repository, install semua library (Laravel + Python/ML), sampai semua service
berjalan.

Terdapat **3 service** yang harus dijalankan bersamaan:

| # | Service | Teknologi | Port |
|---|---------|-----------|------|
| 1 | Backend API | Laravel 13 + MySQL | 8000 |
| 2 | ML Service | Python FastAPI | 8001 |
| 3 | Frontend | Next.js | 3000 |

> **Butuh Internet saat setup pertama**: ML Service akan mengunduh model AI `fastembed`
> (~240 MB) secara otomatis dari HuggingFace. Model ini TIDAK ikut di-commit ke Git,
> jadi diunduh sekali saat pertama kali service dijalankan.

---

## 1. Prasyarat (Install di Laptop Baru)

Install software berikut satu per satu:

| Software | Untuk | Link / Perintah |
|----------|-------|-----------------|
| **PHP 8.3+** | Laravel backend | https://windows.php.net/download (atau Laragon/XAMPP) |
| **Composer** | Dependency PHP | https://getcomposer.org/download/ |
| **MySQL / MariaDB** | Database | Bawaan Laragon/XAMPP, atau https://dev.mysql.com/downloads/ |
| **Python 3.10+** | ML service | https://www.python.org/downloads/ (centang "Add to PATH") |
| **Node.js 18+** | Frontend | https://nodejs.org/ |
| **Git** | Clone repo | https://git-scm.com/ |

> **Rekomendasi**: pakai **Laragon** — sudah termasuk PHP, MySQL, Composer, Node
> dalam satu paket. https://laragon.org/download/

---

## 2. Clone Repository

Buka terminal (Command Prompt / PowerShell), lalu:

```bash
# Pindah ke folder tempat project disimpan
cd C:\Users\<USERNAME>\Documents\GitHub

# Clone repository (ganti URL sesuai repo kamu)
git clone https://github.com/<USERNAME>/MEDORA.git

# Masuk ke folder project
cd MEDORA
```

Folder project berisi 3 sub-folder:

```
MEDORA/
├── medora_be/     # Backend Laravel
├── medora_ml/     # ML Service Python
└── medora_fe/     # Frontend Next.js
```

---

## 3. Setup Database (MySQL)

Buka terminal MySQL, lalu buat database:

```sql
CREATE DATABASE `db-medora`;
```

> Nama database: `db-medora`. Sesuaikan dengan yang ada di `.env` backend.

---

## 4. Setup Backend (medora_be)

### 4.1 Install dependency PHP

```bash
cd medora_be
composer install
```

> `composer install` membaca `composer.lock` & `composer.json`. Jika gagal karena
> `auth.json` / token GitHub, ikuti instruksi yang muncul (buat GitHub personal token
> untuk package manager).

### 4.2 Konfigurasi environment

```bash
# Salin .env.example menjadi .env
copy .env.example .env
```

Edit file `.env` dengan editor, sesuaikan:

```env
APP_NAME=MEDORA
APP_ENV=local
APP_URL=http://localhost:8000

# URL frontend (untuk CORS & redirect Google OAuth)
FRONTEND_URL=http://localhost:3000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db-medora
DB_USERNAME=root
DB_PASSWORD=

# Queue pakai database
QUEUE_CONNECTION=database

# URL ML service
MEDORA_ML_URL=http://127.0.0.1:8001

# Google OAuth (opsional, untuk login Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=${APP_URL}/api/auth/google/callback
```

### 4.3 Generate app key & migrasi

```bash
php artisan key:generate
php artisan migrate
```

### 4.4 Seed data awal

```bash
php artisan db:seed
```

Seeder membuat:
- Admin: `admin@medora.com` / `password`
- 6 bidang keahlian (specialities)
- Data source (PubMed)

### 4.5 (Opsional) Login Google
- Isi `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` di `.env`
- Daftarkan redirect URI di Google Console:
  `http://localhost:8000/api/auth/google/callback`

---

## 5. Setup ML Service (medora_ml)

Ini bagian yang paling penting soal `fastembed`.

### 5.1 Buat virtual environment Python

```bash
cd medora_ml

# Buat venv bernama "venv"
python -m venv venv

# Aktifkan venv (Windows)
venv\Scripts\activate
```

> Setelah aktif, prompt terminal akan diawali `(venv)`.

### 5.2 Install semua library Python

```bash
pip install -r requirements.txt
```

`requirements.txt` sudah berisi `fastembed==0.8.0` dan semua dependency lainnya.

> **Verifikasi** fastembed terinstall:
> ```bash
> python -c "import fastembed; print(fastembed.__version__)"
> ```

### 5.3 Model `.joblib` sudah tersedia

Model ML hasil training (`.joblib`) yang berukuran kecil (< 1 MB) sudah di-commit ke
Git dan ter-download saat clone. **Tidak perlu di-training ulang.**

Pastikan file berikut ada di `medora_ml/models/`:

```
models/
├── medora_model_logreg_ultimate.joblib    # ML1: Claim Analyzer
├── medora_tfidf_ultimate.joblib           # ML1: TF-IDF
├── medora_model_ml2_gabungan.joblib       # ML2: Trust Engine
├── medora_tfidf_ml2_gabungan.joblib       # ML2: TF-IDF
└── ml2_embedding.joblib                   # ML2: embedding
```

### 5.4 Fastembed — download otomatis (SEKALI SAJA)

Model embedding `fastembed` (~240 MB) **TIDAK di-commit** ke Git karena terlalu besar.
Sebaliknya, saat service pertama kali dijalankan, `fastembed` akan **mengunduh sendiri**
model dari HuggingFace ke folder `medora_ml/models/fastembed/`.

Cara memicu download (pilih salah satu):

**Cara A — Langsung jalankan service** (paling mudah):
```bash
# Dari folder medora_ml, dengan venv aktif
start.bat
```
Pada proses start, akan terlihat log mengunduh model. Tunggu sampai muncul
`Application startup complete.` lalu service siap di port 8001.

**Cara B — Download manual dulu** (agar bisa lihat progres jelas):
```bash
python -c "from fastembed import TextEmbedding; TextEmbedding(model_name='sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', cache_dir='models/fastembed')"
```

> **Butuh internet** untuk download ini. Setelah selesai, folder
> `medora_ml/models/fastembed/` akan berisi file model (~240 MB) dan TIDAK perlu
> diunduh lagi (tersimpan lokal di `models/fastembed/`).

### 5.5 (Opsional) Ulang training ML
Jika ingin melatih ulang model dengan dataset sendiri:

```bash
python encode_dataset.py      # encode dataset -> models/embedded/
python train_ml2.py           # train ML2 -> .joblib
```

> Proses ini juga memakai `fastembed` dan menghasilkan `models/embedded/`.

---

## 6. Setup Frontend (medora_fe)

```bash
cd medora_fe

# Install dependency Node
npm install

# (Jika perlu) konfigurasi env
copy .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ML_URL=http://localhost:8001
```

---

## 7. Menjalankan Semua Service

Buka **3 terminal terpisah** (jangan ditutup):

**Terminal 1 — Backend (port 8000):**
```bash
cd medora_be
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 — Queue worker (untuk proses klaim):**
```bash
cd medora_be
php artisan queue:work
```

**Terminal 3 — ML Service (port 8001):**
```bash
cd medora_ml
venv\Scripts\activate
start.bat
```

**Terminal 4 — Frontend (port 3000):**
```bash
cd medora_fe
npm run dev
```

---

## 8. Verifikasi Semua Berjalan

Buka browser dan cek:

| URL | Harusnya Menampilkan |
|-----|----------------------|
| `http://127.0.0.1:8000/api/` | `{ "message": "MEDORA API is online" }` |
| `http://127.0.0.1:8001/` | `{ "message": "MEDORA is online" }` |
| `http://localhost:3000` | Halaman frontend |

**Tes end-to-end cepat (backend + ML):**
1. Login: `POST http://127.0.0.1:8000/api/login` → `{"email":"user@medora.com","password":"password"}`
2. Buat klaim: `POST /api/claims` dengan token
3. Lihat hasil: klaim berubah dari `PENDING` → `ANALYZED`/`REVIEW_NEEDED` (proses via queue worker)

---

## 9. Menjalankan Test Backend

```bash
cd medora_be
php artisan test
```

> Test memakai SQLite in-memory, jadi TIDAK mengganggu database MySQL utama.

---

## 10. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `composer install` gagal | Pastikan PHP & Composer terinstall dan di PATH. Jika diminta token GitHub, buat Personal Access Token di GitHub → Settings → Developer settings → Tokens. |
| `fastembed` tidak terdownload | Pastikan ada koneksi internet & bisa akses `huggingface.co`. Jalankan manual download (Cara B di §5.4). |
| Klaim selalu `FAILED` | Cek terminal queue worker & terminal ML. Pastikan ML service jalan di `8001` dan `MEDORA_ML_URL` benar. |
| Login Google tidak jalan | Pastikan `GOOGLE_CLIENT_ID`/`SECRET` terisi & redirect URI terdaftar. |
| Port 8000/8001/3000 sudah terpakai | Ganti port di perintah `php artisan serve --port=XXXX` / `start.bat` / `npm run dev`. |
| `pip install` lambat | Tambahkan mirror: `pip install -r requirements.txt -i https://pypi.org/simple` |

---

## Struktur .gitignore (medora_ml)

File yang **TIDAK** di-commit (otomatis dibuat di laptop masing-masing):

```
medora_ml/venv/                  # Virtual environment Python
medora_ml/__pycache__/           # Cache bytecode Python
medora_ml/models/fastembed/      # Model fastembed (~240MB, auto-download)
medora_ml/models/embedded/       # Hasil encode dataset (bisa di-reproduksi)
```

Model `.joblib` kecil yang dibutuhkan runtime TETAP di-commit supaya laptop lain
langsung bisa pakai tanpa training ulang.
