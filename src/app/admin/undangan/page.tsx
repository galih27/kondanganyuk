import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORY_LABELS } from "@/lib/invitation-data";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-stone-500/15 text-stone-300 ring-stone-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  ACTIVE: "bg-green-500/15 text-green-400 ring-green-500/30",
  EXPIRED: "bg-red-500/15 text-red-400 ring-red-500/30",
  CANCELED: "bg-red-500/15 text-red-400 ring-red-500/30",
};

const PLAN_CLS: Record<string, string> = {
  FREE: "bg-stone-700/40 text-stone-300",
  BASIC: "bg-brand-500/20 text-brand-400",
  PREMIUM: "bg-purple-500/20 text-purple-400",
};

const STATUSES = ["DRAFT", "PENDING", "ACTIVE", "EXPIRED", "CANCELED"];
const CATEGORIES = ["WEDDING", "KHITAN", "AQIQAH", "BIRTHDAY", "EVENT"];

export default async function AdminUndanganPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status ?? "") ? sp.status : undefined;
  const category = CATEGORIES.includes(sp.category ?? "") ? sp.category : undefined;
  const q = (sp.q ?? "").trim();

  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const invitations = await db.invitation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true, role: true } },
      _count: { select: { wishes: true, guests: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Semua Undangan</h1>
          <p className="mt-1 text-sm text-stone-400">Daftar undangan milik seluruh pengguna.</p>
        </div>
        <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-medium text-stone-300">
          {invitations.length} undangan
        </span>
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari judul, link, atau pemilik…"
          className="w-full max-w-xs rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder-stone-500 outline-none focus:border-brand-500 sm:w-64"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-brand-500"
        >
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-brand-500"
        >
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Terapkan
        </button>
      </form>

      {invitations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-800 p-10 text-center text-sm text-stone-500">
          Tidak ada undangan yang cocok.
        </p>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            let data: { groomName?: string; brideName?: string; personName?: string } = {};
            try { data = JSON.parse(inv.data); } catch { /* abaikan */ }
            const displayName =
              inv.category === "WEDDING"
                ? [data.groomName, data.brideName].filter(Boolean).join(" & ") || "Belum diisi"
                : data.personName || "Belum diisi";
            return (
              <div
                key={inv.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${STATUS_BADGE[inv.status] ?? STATUS_BADGE.DRAFT}`}>
                      {inv.status}
                    </span>
                    <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-[11px] font-medium text-stone-400">
                      {CATEGORY_LABELS[inv.category] ?? inv.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${PLAN_CLS[inv.plan] ?? PLAN_CLS.FREE}`}>
                      {inv.plan}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate font-semibold text-stone-100">{inv.title}</h3>
                  <p className="truncate text-sm text-stone-400">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">
                    /{inv.slug} · 💬 {inv._count.wishes} ucapan · 👥 {inv._count.guests} tamu · 👀 {inv.views}
                  </p>
                  <p className="mt-1 truncate text-xs text-stone-500">
                    👤 {inv.user.name} ({inv.user.email}){inv.user.role === "ADMIN" ? " · ADMIN" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {inv.status === "ACTIVE" && (
                    <a
                      href={`/${inv.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-stone-700 px-4 py-2 text-xs font-semibold text-stone-300 transition hover:border-stone-500 hover:bg-stone-800"
                    >
                      Lihat ↗
                    </a>
                  )}
                  <Link
                    href={`/dashboard/undangan/${inv.id}`}
                    className="rounded-full bg-stone-200 px-4 py-2 text-xs font-semibold text-stone-900 transition hover:bg-white"
                  >
                    Kelola
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
