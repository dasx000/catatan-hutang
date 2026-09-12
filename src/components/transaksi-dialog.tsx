"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";
import type { JenisTransaksi } from "@/lib/types";

export function TransaksiDialog({
  pelangganId,
  jenis,
  saldoSaatIni,
}: {
  pelangganId: string;
  jenis: JenisTransaksi;
  saldoSaatIni: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jumlah, setJumlah] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const isHutang = jenis === "hutang";
  const label = isHutang ? "Tambah Hutang" : "Catat Pembayaran";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nominal = Number(jumlah);
    if (!nominal || nominal <= 0) {
      toast.error("Jumlah harus lebih dari 0.");
      return;
    }
    if (!isHutang && nominal > saldoSaatIni) {
      toast.error("Jumlah pembayaran melebihi sisa hutang.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesi kamu berakhir, silakan masuk lagi.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("transaksi").insert({
      user_id: user.id,
      pelanggan_id: pelangganId,
      jenis,
      jumlah: nominal,
      keterangan: keterangan.trim() || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan: " + error.message);
      return;
    }

    toast.success(isHutang ? "Hutang ditambahkan." : "Pembayaran dicatat.");
    setJumlah("");
    setKeterangan("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isHutang ? "default" : "outline"} />}>
        {isHutang ? (
          <Plus data-icon="inline-start" />
        ) : (
          <HandCoins data-icon="inline-start" />
        )}
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            {isHutang
              ? "Catat tambahan hutang baru untuk pelanggan ini."
              : `Sisa hutang saat ini Rp${saldoSaatIni.toLocaleString("id-ID")}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="jumlah">Jumlah (Rp)</FieldLabel>
              <Input
                id="jumlah"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                placeholder="0"
                inputMode="numeric"
                type="number"
                min={1}
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="keterangan">Keterangan (opsional)</FieldLabel>
              <Input
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder={isHutang ? "misal: beli galon 2" : "misal: bayar cicilan"}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
