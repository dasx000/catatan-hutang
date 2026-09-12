# Catatan Hutang

Aplikasi web untuk mencatat pelanggan yang berhutang: siapa saja yang berhutang, berapa, dan pembayarannya. Dibangun dengan Next.js (App Router) + Supabase (auth & database).

## Setup

### 1. Buat project Supabase (kalau belum ada)

Buka [supabase.com](https://supabase.com), buat project baru, lalu buka **Project Settings > API** untuk mengambil:

- `Project URL`
- `anon public` key

### 2. Isi environment variable

Salin `.env.local.example` menjadi `.env.local`, lalu isi dengan credentials di atas:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Jalankan schema database

Buka **SQL Editor** di dashboard Supabase project kamu, lalu jalankan seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql). Ini akan membuat tabel `pelanggan` & `transaksi` beserta Row Level Security-nya (tiap akun hanya bisa melihat datanya sendiri).

> Secara default Supabase mewajibkan konfirmasi email saat mendaftar. Kalau mau langsung bisa login tanpa konfirmasi email (untuk pemakaian pribadi), matikan di **Authentication > Providers > Email > Confirm email**.

### 4. Jalankan aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000), daftar akun baru lewat tab **Daftar**, lalu mulai catat pelanggan & hutangnya.

## Struktur

- `src/app/login` — halaman masuk/daftar.
- `src/app/(app)` — halaman yang butuh login: dashboard (`/`) dan detail pelanggan (`/pelanggan/[id]`).
- `src/proxy.ts` — proteksi route (redirect ke `/login` kalau belum masuk).
- `src/lib/supabase` — helper koneksi Supabase (browser, server, proxy).
- `supabase/schema.sql` — skema database & RLS policy.
