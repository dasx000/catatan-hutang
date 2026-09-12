import { TambahPelangganDialog } from "@/components/tambah-pelanggan-dialog";
import { PelangganList } from "@/components/pelanggan-list";
import { formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PelangganDenganSaldo, Transaksi } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: pelanggan }, { data: transaksi }] = await Promise.all([
    supabase.from("pelanggan").select("*").order("nama", { ascending: true }),
    supabase.from("transaksi").select("*"),
  ]);

  const saldoMap = new Map<string, number>();
  const terakhirHutangMap = new Map<string, string>();

  for (const t of (transaksi ?? []) as Transaksi[]) {
    const delta = t.jenis === "hutang" ? t.jumlah : -t.jumlah;
    saldoMap.set(t.pelanggan_id, (saldoMap.get(t.pelanggan_id) ?? 0) + delta);

    if (t.jenis === "hutang") {
      const sebelumnya = terakhirHutangMap.get(t.pelanggan_id);
      if (!sebelumnya || t.tanggal > sebelumnya) {
        terakhirHutangMap.set(t.pelanggan_id, t.tanggal);
      }
    }
  }

  const data: PelangganDenganSaldo[] = (pelanggan ?? []).map((p) => ({
    ...p,
    saldo: saldoMap.get(p.id) ?? 0,
    tanggalHutangTerakhir: terakhirHutangMap.get(p.id) ?? null,
  }));

  // Paling lama menunggak duluan; yang lunas turun ke bawah.
  data.sort((a, b) => {
    const aLunas = a.saldo <= 0;
    const bLunas = b.saldo <= 0;
    if (aLunas !== bLunas) return aLunas ? 1 : -1;
    if (!aLunas) {
      const aTgl = a.tanggalHutangTerakhir ?? "";
      const bTgl = b.tanggalHutangTerakhir ?? "";
      if (aTgl !== bTgl) return aTgl < bTgl ? -1 : 1;
    }
    return a.nama.localeCompare(b.nama);
  });

  const totalPiutang = data.reduce((sum, p) => sum + Math.max(p.saldo, 0), 0);
  const jumlahBerhutang = data.filter((p) => p.saldo > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-accent p-6 text-accent-foreground shadow-clay-lg">
        <p className="text-sm font-medium text-accent-foreground/75">
          Total piutang beredar
        </p>
        <p className="mt-1 font-mono text-[2.75rem] leading-none font-bold tabular-nums">
          {formatRupiah(totalPiutang)}
        </p>
        <span
          className={
            "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold " +
            (jumlahBerhutang === 0
              ? "bg-paid text-white"
              : "bg-white/20 text-accent-foreground")
          }
        >
          {jumlahBerhutang === 0
            ? "Semua pelanggan sudah lunas"
            : `${jumlahBerhutang} pelanggan belum bayar`}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold">Pelanggan</h2>
        <TambahPelangganDialog />
      </div>

      <PelangganList data={data} />
    </div>
  );
}
