import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HandCoins, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { TransaksiDialog } from "@/components/transaksi-dialog";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Transaksi } from "@/lib/types";

export default async function PelangganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pelanggan }, { data: transaksi }] = await Promise.all([
    supabase.from("pelanggan").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("transaksi")
      .select("*")
      .eq("pelanggan_id", id)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (!pelanggan) {
    notFound();
  }

  const daftarTransaksi = (transaksi ?? []) as Transaksi[];
  const saldo = daftarTransaksi.reduce(
    (sum, t) => sum + (t.jenis === "hutang" ? t.jumlah : -t.jumlah),
    0
  );
  const lunas = saldo <= 0;

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        render={<Link href="/" />}
        nativeButton={false}
      >
        <ArrowLeft data-icon="inline-start" />
        Kembali
      </Button>

      <div
        className={
          "flex flex-col gap-5 rounded-3xl p-6 shadow-clay-lg " +
          (lunas ? "bg-paid text-white" : "bg-destructive text-destructive-foreground")
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-bold">
              {pelanggan.nama}
            </h1>
            {pelanggan.telepon && (
              <p className="text-sm text-white/75">{pelanggan.telepon}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide uppercase">
            {lunas ? "Lunas" : "Belum lunas"}
          </span>
        </div>

        <div>
          <p className="text-sm text-white/75">Sisa hutang</p>
          <p className="mt-1 font-mono text-[2.5rem] leading-none font-bold tabular-nums">
            {formatRupiah(Math.max(saldo, 0))}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <TransaksiDialog pelangganId={pelanggan.id} jenis="hutang" saldoSaatIni={saldo} />
          {!lunas && (
            <TransaksiDialog pelangganId={pelanggan.id} jenis="bayar" saldoSaatIni={saldo} />
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-bold">
          Riwayat transaksi
        </h2>

        {daftarTransaksi.length === 0 ? (
          <Empty className="border-foreground/15">
            <EmptyTitle>Belum ada transaksi</EmptyTitle>
            <EmptyDescription>
              Tambah hutang pertama untuk pelanggan ini.
            </EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {daftarTransaksi.map((t) => {
              const isHutang = t.jenis === "hutang";
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-3xl border-2 border-foreground/5 bg-card p-4 shadow-clay-sm dark:border-white/10"
                >
                  <span
                    className={
                      "flex size-10 shrink-0 items-center justify-center rounded-2xl " +
                      (isHutang
                        ? "bg-destructive/15 text-destructive"
                        : "bg-paid/15 text-paid")
                    }
                  >
                    {isHutang ? (
                      <Plus className="size-[18px]" strokeWidth={2.5} />
                    ) : (
                      <HandCoins className="size-[18px]" strokeWidth={2.5} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold">
                      {t.keterangan || (isHutang ? "Hutang baru" : "Pembayaran")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTanggal(t.tanggal)}
                    </p>
                  </div>
                  <span
                    className={
                      "shrink-0 font-mono text-[15px] font-bold tabular-nums " +
                      (isHutang ? "text-debt" : "text-paid")
                    }
                  >
                    {isHutang ? "+" : "−"}
                    {formatRupiah(t.jumlah)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
