"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatRelatif, formatRupiah } from "@/lib/format";
import type { PelangganDenganSaldo } from "@/lib/types";

export function PelangganList({ data }: { data: PelangganDenganSaldo[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => p.nama.toLowerCase().includes(q));
  }, [data, query]);

  if (data.length === 0) {
    return (
      <Empty className="border-foreground/15">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlus />
          </EmptyMedia>
          <EmptyTitle>Belum ada pelanggan</EmptyTitle>
          <EmptyDescription>
            Tambah pelanggan pertama untuk mulai mencatat hutangnya.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari pelanggan..."
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Tidak ada pelanggan yang cocok dengan &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((p) => {
            const lunas = p.saldo <= 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/pelanggan/${p.id}`}
                  className="flex items-center justify-between gap-3 rounded-3xl border-2 border-foreground/5 bg-card p-4 shadow-clay-sm transition-transform active:translate-y-0.5 active:shadow-clay-pressed dark:border-white/10"
                >
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[15px] font-semibold">
                      {p.nama}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {lunas
                        ? "Tidak ada tunggakan"
                        : p.tanggalHutangTerakhir
                          ? `Berhutang sejak ${formatRelatif(p.tanggalHutangTerakhir)}`
                          : "Belum ada transaksi"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={
                        "font-mono text-[15px] font-bold tabular-nums " +
                        (lunas ? "text-muted-foreground" : "text-debt")
                      }
                    >
                      {lunas ? "—" : formatRupiah(p.saldo)}
                    </span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase " +
                        (lunas
                          ? "bg-paid/15 text-paid"
                          : "bg-destructive/15 text-destructive")
                      }
                    >
                      {lunas ? "Lunas" : "Belum lunas"}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
