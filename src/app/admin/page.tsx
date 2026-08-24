import { db } from "@/lib/db";
import { ConfirmPaymentButton } from "@/components/admin/confirm-payment-button";
import { formatRupiah, formatDateTimeID } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAY_STATUS_CLS: Record<string, string> = {
  UNPAID: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  PAID: "bg-green-500/15 text-green-400 ring-green-500/30",
  EXPIRED: "bg-stone-500/15 text-stone-400 ring-stone-500/30",
  FAILED: "bg-red-500/15 text-red-400 ring-red-500/30",
};

export default async function AdminPage() {
  const [totalUsers, totalInvitations, activeInvitations, payments, recentUsers] = await Promise.all([
    db.user.count(),
    db.invitation.count(),
    db.invitation.count({ where: { status: "ACTIVE" } }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true, email: true } }, invitation: { select: { title: true, slug: true } } },
    }),
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { invitations: true } } } }),
  ]);

  const revenue = await db.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } });
  const pendingPayments = payments.filter((p) => p.status === "UNPAID");

  const stats = [
    ["Pengguna", totalUsers, "👤"],
    ["Undangan", totalInvitations, "💌"],
    ["Undangan aktif", activeInvitations, "✅"],
    ["Pendapatan", formatRupiah(revenue._sum.amount ?? 0), "💰"],
  ] as const;

  return (
    <div className="space-y-10">
      {/* Statistik */}
      <div>
        <h1 className="text-xl font-bold">Ringkasan</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([label, value, icon]) => (
            <div key={label} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
              <span className="text-xl">{icon}</span>
              <p className="mt-2 truncate text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pembayaran menunggu konfirmasi */}
      <section>
        <h2 className="text-lg font-semibold">
          Menunggu Konfirmasi <span className="ml-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-sm text-amber-400">{pendingPayments.length}</span>
        </h2>
        {pendingPayments.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-stone-800 p-6 text-center text-sm text-stone-500">
            Tidak ada pembayaran yang perlu dikonfirmasi 🎉
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingPayments.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {formatRupiah(p.amount)} · {p.plan}
                  </p>
                  <p className="truncate text-xs text-stone-400">
                    {p.orderId} · {p.method ?? "-"} · {p.user.name} ({p.user.email})
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    Undangan: {p.invitation?.title ?? "-"} /{p.invitation?.slug ?? "-"}
                  </p>
                </div>
                <ConfirmPaymentButton paymentId={p.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        {/* Semua transaksi */}
        <section className="min-w-0">
          <h2 className="text-lg font-semibold">Transaksi Terbaru</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-800">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="bg-stone-900 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/70">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-900/60">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.orderId}</p>
                      <p className="text-xs text-stone-500">{p.plan} · {p.method ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatRupiah(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${PAY_STATUS_CLS[p.status] ?? ""}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400">{formatDateTimeID(p.createdAt)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-500">Belum ada transaksi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pengguna terbaru */}
        <section>
          <h2 className="text-lg font-semibold">Pengguna Terbaru</h2>
          <ul className="mt-4 divide-y divide-stone-800 rounded-2xl border border-stone-800">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}{u.role === "ADMIN" && <span className="ml-2 rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-400">ADMIN</span>}</p>
                  <p className="truncate text-xs text-stone-500">{u.email} · {u._count.invitations} undangan</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
