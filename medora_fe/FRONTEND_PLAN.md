# MEDORA Frontend — Rencana Implementasi

## Informasi Backend (untuk referensi integrasi)

| Item | Detail |
|---|---|
| **Backend URL** | `http://localhost:8000` |
| **API Prefix** | `/api` |
| **Auth** | Sanctum Personal Access Tokens (Bearer `Authorization: Bearer {token}`) |
| **Token storage** | localStorage (`medora_token`, `medora_user`) |
| **ML Service** | `http://127.0.0.1:8001` (tidak perlu diakses langsung dari frontend) |
| **Frontend URL** | `http://localhost:3000` |

---

## 1. Setup Proyek

### 1.1. State Management (Zustand)

```
npm install axios zustand
```

### 1.2. API Client — `src/lib/api.ts`

Buat axios instance dengan:
- `baseURL: http://localhost:8000/api`
- Request interceptor: attach `Authorization: Bearer {token}` dari localStorage
- Response interceptor: jika 401 → clear token & redirect ke `/auth/login`

### 1.3. Auth Store — `src/store/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  role: 'USER' | 'REVIEWER' | 'ADMIN' | null;
}
```

Persist ke localStorage menggunakan Zustand `persist` middleware.

### 1.4. Route Protection

Buat komponen wrapper `ProtectedRoute` untuk:
- **Protected (any role)**: redirect jika tidak login
- **RoleUser**: hanya USER
- **RoleReviewer**: hanya REVIEWER
- **RoleAdmin**: hanya ADMIN

---

## 2. Halaman Auth

### 2.1. Login — `src/app/auth/login/page.tsx`
- Form: email + password
- Tombol "Login with Google" → redirect ke `http://localhost:8000/api/auth/google`
- Link ke register & forgot password
- **Endpoint**: `POST /api/login` → return `{ token, user }`
- Setelah sukses: simpan token + user ke Zustand + localStorage → redirect ke dashboard

### 2.2. Register — `src/app/auth/register/page.tsx`
- Dua mode (tab/select):
  - **User**: name, email, password, confirm password
  - **Reviewer**: name, email, password, confirm password, **nomor STR**, **bidang keahlian** (dropdown dari `GET /api/specialities`)
- **Endpoint**: `POST /api/register` dengan body `{ name, email, password, password_confirmation, role, str_number?, speciality_id? }`
- Setelah sukses: tampilkan notifikasi "Akun berhasil dibuat. Silakan login."

### 2.3. Google Callback — `src/app/auth/callback/page.tsx`
- Halaman ini menerima parameter URL: `?token=xxx&user=...`
- Baca `token` dari URL search params
- Panggil `GET /api/me` untuk ambil data user
- Simpan ke Zustand + localStorage
- Redirect ke dashboard (untuk USER) atau waiting page (untuk REVIEWER dengan status PENDING)

### 2.4. Forgot Password — `src/app/auth/forgot-password/page.tsx`
- Form: email
- **Endpoint**: `POST /api/forgot-password`
- Tampilkan sukses message

### 2.5. Reset Password — `src/app/auth/reset-password/page.tsx`
- Menerima token dari email (dikirim via URL)
- Form: email, password, confirm password
- **Endpoint**: `POST /api/reset-password`

### 2.6. Email Verify Notice — `src/app/auth/verify/page.tsx`
- Tampilkan pesan "Cek email untuk verifikasi"
- Tombol "Kirim ulang email verifikasi"
- **Endpoint**: `POST /api/email/resend`

---

## 3. Halaman User

### 3.1. Dashboard — `src/app/dashboard/page.tsx`
- Text area untuk input klaim (max 5000 karakter)
- Tombol "Analisis Klaim"
- **Endpoint**: `POST /api/claims` dengan body `{ text }`
- Setelah submit: tampilkan loading dengan animasi, redirect ke halaman detail klaim

### 3.2. History — `src/app/history/page.tsx`
- List klaim user (urut dari terbaru)
- Tampilkan: teks (potong 100 karakter), status badge, tanggal
- Setiap item bisa diklik menuju detail klaim
- **Endpoint**: `GET /api/claims`
- Status badge color:
  - `PENDING` → yellow
  - `ANALYZED` → green
  - `REVIEW_NEEDED` → orange
  - `REVIEWED` → blue
  - `FAILED` → red

### 3.3. Claim Detail — `src/app/claims/[id]/page.tsx`
- Polling setiap 3 detik jika status masih `PENDING`
- Tampilkan:
  - **Teks klaim** (lengkap)
  - **Hasil ML #1**: is_claim, kategori, subjek, relasi, objek, confidence
  - **List Evidence**: setiap card menampilkan judul, PMID, publikasi tahun, relationship (SUPPORT/CONTRADICT/NEUTRAL/INSUFFICIENT), relevance score
  - **Trust Assessment**: evidence strength (progress bar), trust score, supporting/contradicting/neutral/insufficient count, assessment text
  - **Status badge**
- **Endpoint**: `GET /api/claims/{id}`

### 3.4. Settings — `src/app/settings/page.tsx`
- Edit profil: name
- **Endpoint**: `PUT /api/profile`
- Change password: current_password, password, confirm
- **Endpoint**: `PUT /api/password`
- Avatar (opsional): upload foto

---

## 4. Halaman Admin

### 4.1. Reviewer Approvals — `src/app/admin/reviewers/page.tsx`
- List reviewer dengan status `PENDING`
- Setiap item: nama, email, nomor STR, bidang keahlian, tombol **Approve** / **Reject**
- **Endpoint list**: `GET /api/admin/reviewers/pending`
- **Endpoint approve**: `POST /api/admin/reviewers/{id}/approve`
- **Endpoint reject**: `POST /api/admin/reviewers/{id}/reject`

### 4.2. Kelola Specialities — `src/app/admin/specialities/page.tsx`
- CRUD kategori bidang keahlian:
  - List semua kategori
  - Form tambah (name)
  - Edit inline/modal
  - Hapus dengan konfirmasi
- **Endpoints**: `GET|POST /api/admin/specialities`, `PUT|DELETE /api/admin/specialities/{id}`

---

## 5. Halaman Reviewer

### 5.1. Review Queue — `src/app/review/queue/page.tsx`
- List klaim dengan status `REVIEW_NEEDED`
- Tampilkan: teks klaim, evidence strength, trust score, jumlah evidence
- **Endpoint**: `GET /api/review/claims`
- Klik item → menuju halaman review detail

### 5.2. Review Detail — `src/app/review/claims/[id]/page.tsx`
- Tampilan terbagi:
  - **Informasi Klaim**: teks lengkap + hasil ML #1
  - **List Evidence**: setiap card berisi:
    - Judul, abstract, PMID, URL
    - Relationship dari ML #2 (SUPPORT/CONTRADICT/NEUTRAL/INSUFFICIENT)
    - Tombol **Confirm** / **Reject** (per evidence)
    - Jika sudah direview, tampilkan status CONFIRMED/REJECTED
  - **Final Verdict** (setelah semua evidence di-review):
    - Dropdown/radio: HOAX / FACT
    - Textarea: catatan review
    - Tombol "Submit Verdict"
- **Endpoints**:
  - `POST /api/claims/{claim}/evidences/{ce}/review` — body: `{ status: 'CONFIRMED'|'REJECTED' }`
  - `POST /api/claims/{claim}/review` — body: `{ verdict: 'HOAX'|'FACT', note? }`

---

## 6. Komponen yang Perlu Dibuat

| Komponen | Lokasi | Keterangan |
|---|---|---|
| `Navbar` | `src/components/Navbar.tsx` | Navigasi utama, avatar dropdown, logout |
| `StatusBadge` | `src/components/StatusBadge.tsx` | Badge warna untuk status klaim |
| `EvidenceCard` | `src/components/EvidenceCard.tsx` | Card evidence dengan relationship badge |
| `TrustGauge` | `src/components/TrustGauge.tsx` | Progress bar / gauge untuk evidence strength |
| `LoadingSpinner` | `src/components/LoadingSpinner.tsx` | Loading/processing state |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Route guard berdasarkan role |

---

## 7. Flow Utama (Lengkap)

```
1. User buka app → login (email/Google)
2. User input teks klaim → submit → POST /api/claims
   → Backend return { claim: {id, status: 'PENDING'} }
   → Frontend redirect ke /claims/{id}
3. Halaman detail klaim polling setiap 3 detik
   → Status berubah 'ANALYZED' atau 'REVIEW_NEEDED' atau 'FAILED'
4. Jika ANALYZED: tampilkan hasil lengkap (evidence + trust assessment)
5. Jika REVIEW_NEEDED: tampilkan evidence + note "Menunggu review ahli"
6. Reviewer login → buka /review/queue
7. Reviewer buka detail → review per evidence (CONFIRM/REJECT)
8. Reviewer submit verdict final (HOAX/FACT)
9. Status klaim → REVIEWED
10. User lihat hasil final di detail klaim
```

---

## 8. Tips Implementasi

- **TypeScript** — buat tipe interface di `src/types/index.ts` untuk User, Claim, Evidence, TrustAssessment, dll.
- **Error handling** — axios interceptor 401 → logout otomatis; tampilkan error toast untuk 422 (validasi) dan 500.
- **Loading states** — gunakan Suspense atau loading skeleton.
- **Responsive** — Tailwind sudah siap, gunakan `sm:`, `md:`, `lg:` breakpoints.
- **Polling** — gunakan `setInterval` + cleanup di `useEffect` saat status PENDING; polling berhenti saat status != PENDING.
- **Google OAuth flow**:
  1. User klik tombol Google → `window.location.href = 'http://localhost:8000/api/auth/google'`
  2. Backend Google callback → redirect ke `http://localhost:3000/auth/callback?token=xxx`
  3. Halaman callback baca `token` dari URL → simpan ke Zustand + localStorage

---

## 9. Daftar Lengkap Endpoint API

### Auth (Public)
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/register` | Register user/reviewer |
| POST | `/api/login` | Login email/password |
| GET | `/api/auth/google` | Redirect Google OAuth (return `{ url }`) |
| GET | `/api/auth/google/callback` | Google callback (redirect ke frontend dgn token) |
| POST | `/api/forgot-password` | Kirim email reset password |
| POST | `/api/reset-password` | Reset password |
| POST | `/api/email/verify/{id}/{hash}` | Verifikasi email |
| POST | `/api/email/resend` | Kirim ulang verifikasi email |

### Authenticated (Bearer Token)
| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| POST | `/api/logout` | All | Logout & revoke token |
| GET | `/api/me` | All | Profil user saat ini |
| PUT | `/api/profile` | All | Update profil |
| PUT | `/api/password` | All | Update password |
| DELETE | `/api/profile` | All | Hapus akun |
| GET | `/api/claims` | USER | History klaim user |
| POST | `/api/claims` | USER | Submit klaim baru |
| GET | `/api/claims/{id}` | USER | Detail klaim |
| GET | `/api/specialities` | All | List bidang keahlian |

### Reviewer
| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| GET | `/api/review/claims` | REVIEWER | List klaim REVIEW_NEEDED |
| POST | `/api/claims/{id}/evidences/{ce}/review` | REVIEWER | Review per-evidence |
| POST | `/api/claims/{id}/review` | REVIEWER | Submit verdict final |

### Admin
| Method | Endpoint | Role | Deskripsi |
|---|---|---|---|
| GET | `/api/admin/reviewers/pending` | ADMIN | List reviewer pending |
| POST | `/api/admin/reviewers/{id}/approve` | ADMIN | Approve reviewer |
| POST | `/api/admin/reviewers/{id}/reject` | ADMIN | Reject reviewer |
| GET | `/api/admin/specialities` | ADMIN | List specialities |
| POST | `/api/admin/specialities` | ADMIN | Tambah speciality |
| PUT | `/api/admin/specialities/{id}` | ADMIN | Edit speciality |
| DELETE | `/api/admin/specialities/{id}` | ADMIN | Hapus speciality |

---

## 10. Struktur Folder yang Diharapkan

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── callback/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify/
│   ├── dashboard/
│   ├── history/
│   ├── claims/[id]/
│   ├── settings/
│   ├── admin/
│   │   ├── reviewers/
│   │   └── specialities/
│   ├── review/
│   │   ├── queue/
│   │   └── claims/[id]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   ├── EvidenceCard.tsx
│   ├── TrustGauge.tsx
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── store/
│   └── authStore.ts
├── lib/
│   └── api.ts
└── types/
    └── index.ts
```