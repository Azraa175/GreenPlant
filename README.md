# GreenPlant 🌱

GreenPlant adalah aplikasi cerdas untuk manajemen proyek pertanian dan prediksi panen, dirancang untuk membantu petani modern dalam merencanakan, mencatat, dan menganalisis siklus panen mereka dengan lebih baik.

## Fitur Utama 🌟

- **Manajemen Proyek Tanaman**: Kelola berbagai area lahan dan jenis tanaman yang sedang ditanam.
- **Prediksi Panen**: Prediksi pintar menggunakan algoritma berdasarkan data masukan cuaca, luas lahan, dan parameter lainnya.
- **Rekomendasi Cerdas**: Dapatkan rekomendasi berdasarkan hasil prediksi untuk meningkatkan efisiensi.
- **Penyimpanan Cloud Otomatis**: Dilengkapi dengan _fallback_ ke mode lokal (offline) jika Supabase belum dikonfigurasi.
- **Sistem Keamanan Akun**:
  - Dukungan otentikasi Google Account (Native) maupun otentikasi Email biasa.
  - Pengecekan kekuatan password.
  - Verifikasi kode OTP nomor HP.
  - Sistem penguncian akun sementara (Account Lockout) untuk melindungi dari _brute force_.
- **Mode Gelap (Dark Mode)**: Tampilan UI modern yang nyaman di mata baik siang maupun malam.

## Teknologi yang Digunakan 💻

- **Frontend**: React (Vite), Tailwind CSS
- **Animasi & Ikon**: Framer Motion, Lucide React
- **Penyimpanan Database & Auth**: Supabase (PostgreSQL)
- **Deployment & Tooling**: PWA didukung dengan `vite-plugin-pwa`

## Keamanan Data & Privasi 🔒

1. Kredensial sensitif seperti **Supabase URL** dan **Anon Key** tidak dipublikasikan ke repositori ini. Parameter tersebut dikelola dengan aman melalui file `.env`.
2. Password pengguna dienkripsi dengan metode standar SHA-256 (di dalam database Supabase menggunakan _Bcrypt_ bawaan).

## Panduan Instalasi Lokal 🚀

### 1. Kloning Repositori

```bash
git clone <url-repository-ini>
cd KecerdasanBuatan
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Setup Lingkungan (Environment Variables)

Buat file baru bernama `.env` di folder utama aplikasi, lalu salin struktur dari `.env.example`:

```env
VITE_SUPABASE_URL=isi_dengan_url_project_anda
VITE_SUPABASE_ANON_KEY=isi_dengan_anon_public_key_anda
```
> Anda bisa mendapatkan key ini dari Dashboard Supabase -> Project Settings -> API.

### 4. Setup Tabel Database Supabase (Sekali Saja)

Buka menu **SQL Editor** di Dashboard Supabase, dan jalankan seluruh query SQL yang ada di file `supabase-setup.sql`. Skrip ini akan membuat tabel-tabel utama (`projects`, `input_data`, `predictions`, `recommendations`) sekaligus mengamankannya dengan **Row Level Security (RLS)**.

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka `http://localhost:5173` di browser Anda.
