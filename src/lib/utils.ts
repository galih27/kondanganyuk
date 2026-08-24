export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export const RESERVED_SLUGS = new Set([
  "api", "dashboard", "admin", "masuk", "daftar", "harga", "tema", "fitur",
  "pesanan", "ucapan", "checkin", "blog", "kontak", "tentang", "kebijakan",
  "syarat", "bantuan", "login", "register", "signup", "signin", "public",
  "_next", "static", "favicon.ico", "robots.txt", "sitemap.xml",
]);

export function formatDateID(date?: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTimeID(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function generateOrderId() {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KY-${t}${r}`;
}
