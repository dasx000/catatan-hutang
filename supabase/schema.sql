-- Jalankan file ini di Supabase Dashboard > SQL Editor (sekali saja, saat setup awal).
-- Setelah dijalankan, tambahkan skema "hutang" ke Settings > API > Exposed schemas
-- supaya bisa diakses lewat PostgREST (client pakai db.schema = "hutang").

create extension if not exists "pgcrypto";

create schema if not exists hutang;

create table if not exists hutang.pelanggan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama text not null,
  telepon text,
  catatan text,
  created_at timestamptz not null default now()
);

create table if not exists hutang.transaksi (
  id uuid primary key default gen_random_uuid(),
  pelanggan_id uuid not null references hutang.pelanggan (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  jenis text not null check (jenis in ('hutang', 'bayar')),
  jumlah numeric not null check (jumlah > 0),
  keterangan text,
  tanggal date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transaksi_pelanggan_id_idx on hutang.transaksi (pelanggan_id);
create index if not exists transaksi_user_id_idx on hutang.transaksi (user_id);
create index if not exists pelanggan_user_id_idx on hutang.pelanggan (user_id);

-- Hak akses ke skema kustom: Supabase tidak otomatis memberi grant di luar "public".
grant usage on schema hutang to authenticated, service_role;
grant all on all tables in schema hutang to authenticated, service_role;
grant all on all sequences in schema hutang to authenticated, service_role;
alter default privileges in schema hutang grant all on tables to authenticated, service_role;
alter default privileges in schema hutang grant all on sequences to authenticated, service_role;

-- Row Level Security: setiap user cuma boleh baca/tulis/hapus datanya sendiri.
alter table hutang.pelanggan enable row level security;
alter table hutang.transaksi enable row level security;

-- drop-if-exists di setiap policy supaya file ini aman dijalankan ulang
-- di database yang sudah pernah di-setup sebelumnya (misal cuma mau
-- menambah policy delete yang belum ada), tanpa error "already exists".
drop policy if exists "pelanggan_select_own" on hutang.pelanggan;
create policy "pelanggan_select_own" on hutang.pelanggan
  for select using (auth.uid() = user_id);
drop policy if exists "pelanggan_insert_own" on hutang.pelanggan;
create policy "pelanggan_insert_own" on hutang.pelanggan
  for insert with check (auth.uid() = user_id);
drop policy if exists "pelanggan_update_own" on hutang.pelanggan;
create policy "pelanggan_update_own" on hutang.pelanggan
  for update using (auth.uid() = user_id);
drop policy if exists "pelanggan_delete_own" on hutang.pelanggan;
create policy "pelanggan_delete_own" on hutang.pelanggan
  for delete using (auth.uid() = user_id);

drop policy if exists "transaksi_select_own" on hutang.transaksi;
create policy "transaksi_select_own" on hutang.transaksi
  for select using (auth.uid() = user_id);
drop policy if exists "transaksi_insert_own" on hutang.transaksi;
create policy "transaksi_insert_own" on hutang.transaksi
  for insert with check (auth.uid() = user_id);
drop policy if exists "transaksi_update_own" on hutang.transaksi;
create policy "transaksi_update_own" on hutang.transaksi
  for update using (auth.uid() = user_id);
drop policy if exists "transaksi_delete_own" on hutang.transaksi;
create policy "transaksi_delete_own" on hutang.transaksi
  for delete using (auth.uid() = user_id);
