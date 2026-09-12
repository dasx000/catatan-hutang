"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
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

export function TambahPelangganDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim()) return;

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

    const { error } = await supabase.from("pelanggan").insert({
      user_id: user.id,
      nama: nama.trim(),
      telepon: telepon.trim() || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Gagal menambah pelanggan: " + error.message);
      return;
    }

    toast.success(`${nama.trim()} ditambahkan.`);
    setNama("");
    setTelepon("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus data-icon="inline-start" />
        Tambah Pelanggan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan</DialogTitle>
          <DialogDescription>
            Simpan data pelanggan baru untuk mulai mencatat hutangnya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="nama">Nama</FieldLabel>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama pelanggan"
                required
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="telepon">No. Telepon (opsional)</FieldLabel>
              <Input
                id="telepon"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
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
