import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-chrome";
import { PLANS } from "@/lib/plans";
import { formatRupiah, formatDateTimeID } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Harga & Paket",
  description: "Pilih paket undangan digital Kondanganyuk — mulai gratis, aktif tanpa biaya bulanan.",
};

export default async function HargaPage() {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen">
      <SiteHeader authed={!!user} />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">Harga &amp; Paket</h1>
          <p className="mx-auto mt-4 max-w-xl text-stone-600">
            Semua paket sekali bayar per undangan — tidak ada langganan bulanan.
            Coba gratis dulu, upgrade kapan saja.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-white p-8 ${
                plan.highlight ? "border-brand-500 shadow-xl shadow-brand-100" : "border-stone-200 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                  Paling Populer
                </span>
              )}
              <h2 className="text-xl font-semibold text-stone-800">{plan.name}</h2>
              <p className="mt-1 text-sm text-stone-500">{plan.tagline}</p>
              <p className="mt-5">
                <span className="text-4xl font-bold text-stone-900">
                  {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                </span>
                <span className="ml-2 text-sm text-stone-400">
                  /undungan · {plan.durationDays ? `aktif ${plan.durationDays} hari` : "aktif selamanya"}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f.label} className={`flex items-start gap-2.5 ${f.included ? "text-stone-700" : "text-stone-300 line-through"}`}>
                    <span className={f.included ? "text-green-600" : "text-stone-300"}>{f.included ? "✓" : "✕"}</span>
                    {f.label}
                  </li>
                ))}
              </ul>
              <Link
                href="/daftar"
                className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200 hover:bg-brand-700"
                    : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                {plan.price === 0 ? "Mulai Gratis" : `Pilih ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-stone-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-stone-800">Metode pembayaran</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["QRIS", "BCA VA", "BRI VA", "BNI VA", "Alfamart", "Indomaret", "Semua e-wallet via QRIS"].map((m) => (
              <span key={m} className="rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-sm text-stone-600">
                {m}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-stone-500">
            Pembayaran diproses oleh mitra pembayaran berlisensi (Tripay). Undangan Anda akan
            aktif otomatis beberapa saat setelah pembayaran terkonfirmasi.
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-stone-400">
          Halaman ini dibuat {formatDateTimeID(new Date())} — harga dapat berubah sewaktu-waktu.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
