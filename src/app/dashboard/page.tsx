import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { CATEGORY_LABELS } from "@/lib/invitation-data";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-600 border-stone-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-red-50 text-red-600 border-red-200",
  CANCELED: "bg-red-50 text-red-600 border-red-200",
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const invitations = await db.invitation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { wishes: true, guests: true } } },
  });

  const totalWishes = invitations.reduce((a, i) => a + i._count.wishes, 0);
  const totalViews = invitations.reduce((a, i) => a + i.views, 0);
  const activeCount = invitations.filter((i) => i.status === "ACTIVE").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Hai, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-stone-500">Kelola semua undangan Anda di sini.</p>
        </div>
        <Link
          href="/dashboard/baru"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700"
        >
          + Buat Undangan
        </Link>
      </div>

      {/* Statistik */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Total undangan", invitations.length, "💌"],
          ["Aktif", activeCount, "✅"],
          ["Total ucapan", totalWishes, "🙏"],
          ["Total kunjungan", totalViews, "👀"],
        ].map(([label, value, icon]) => (
          <div key={String(label)} className="rounded-2xl border border-stone-200 bg-white p-5">
            <span className="text-xl">{icon}</span>
            <p className="mt-2 text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Daftar undangan */}
      <h2 className="mt-10 mb-4 text-lg font-semibold text-stone-800">Undangan Anda</h2>
      {invitations.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-5xl">🎉</p>
          <h3 className="mt-4 text-lg font-semibold text-stone-800">Belum ada undangan</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500">
            Buat undangan pertama Anda — gratis untuk dicoba, tanpa perlu kartu kredit.
          </p>
          <Link
            href="/dashboard/baru"
            className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700"
          >
            Buat Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((inv) => {
            let data: { groomName?: string; brideName?: string; personName?: string } = {};
            try { data = JSON.parse(inv.data); } catch { /* abaikan */ }
            const displayName =
              inv.category === "WEDDING"
                ? [data.groomName, data.brideName].filter(Boolean).join(" & ") || "Belum diisi"
                : data.personName || "Belum diisi";
            return (
              <div key={inv.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[inv.status] ?? STATUS_BADGE.DRAFT}`}>
                      {inv.status}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                      {CATEGORY_LABELS[inv.category] ?? inv.category}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">
                      {inv.plan}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate font-semibold text-stone-800">{inv.title}</h3>
                  <p className="truncate text-sm text-stone-500">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-stone-400">/{inv.slug} · 💬 {inv._count.wishes} ucapan · 👥 {inv._count.guests} tamu · 👀 {inv.views}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {inv.status === "ACTIVE" && (
                    <a
                      href={`/${inv.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                    >
                      Lihat ↗
                    </a>
                  )}
                  {inv.status === "PENDING" && (
                    <Link href={`/dashboard/undangan/${inv.id}?bayar=1`} className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600">
                      Selesaikan Pembayaran
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/undangan/${inv.id}`}
                    className="rounded-full bg-stone-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-700"
                  >
                    Kelola
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info paket */}
      <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50/60 p-6">
        <h3 className="font-semibold text-stone-800">Butuh fitur lebih?</h3>
        <p className="mt-1 text-sm text-stone-600">
          Upgrade ke Basic mulai {formatRupiah(49000)} atau Premium {formatRupiah(99000)} sekali bayar.
        </p>
        <Link href="/harga" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">
          Lihat perbandingan paket →
        </Link>
      </div>
    </div>
  );
}
