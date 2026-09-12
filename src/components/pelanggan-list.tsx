"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatRelatif, formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { PelangganDenganSaldo } from "@/lib/types";

export function PelangganList({ data }: { data: PelangganDenganSaldo[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => p.nama.toLowerCase().includes(q));
  }, [data, query]);

  async function handleDelete(id: string, nama: string) {
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("pelanggan").delete().eq("id", id);
    setDeletingId(null);

    if (error) {
      toast.error("Gagal menghapus pelanggan: " + error.message);
      return;
    }

    toast.success(`${nama} dihapus.`);
    router.refresh();
  }

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
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-3xl border-2 border-foreground/5 bg-card p-4 shadow-clay-sm dark:border-white/10"
              >
                <Link
                  href={`/pelanggan/${p.id}`}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3"
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

                {lunas && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        />
                      }
                    >
                      <Trash2 />
                      <span className="sr-only">Hapus {p.nama}</span>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus {p.nama}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Seluruh riwayat transaksi pelanggan ini akan ikut
                          terhapus permanen. Tindakan ini tidak bisa
                          dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p.id, p.nama)}
                        >
                          {deletingId === p.id ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
