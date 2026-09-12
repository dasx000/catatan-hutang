export type Pelanggan = {
  id: string;
  user_id: string;
  nama: string;
  telepon: string | null;
  catatan: string | null;
  created_at: string;
};

export type JenisTransaksi = "hutang" | "bayar";

export type Transaksi = {
  id: string;
  pelanggan_id: string;
  user_id: string;
  jenis: JenisTransaksi;
  jumlah: number;
  keterangan: string | null;
  tanggal: string;
  created_at: string;
};

export type PelangganDenganSaldo = Pelanggan & {
  saldo: number;
  tanggalHutangTerakhir: string | null;
};
