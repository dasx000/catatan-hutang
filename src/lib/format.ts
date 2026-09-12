export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelatif(date: string) {
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const hari = Math.round((hariIni.getTime() - target.getTime()) / 86_400_000);

  if (hari <= 0) return "hari ini";
  if (hari === 1) return "kemarin";
  if (hari < 30) return `${hari} hari lalu`;

  const bulan = Math.round(hari / 30);
  if (bulan < 12) return `${bulan} bulan lalu`;

  const tahun = Math.round(hari / 365);
  return `${tahun} tahun lalu`;
}
