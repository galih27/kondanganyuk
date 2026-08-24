"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export function OrderClient({
  mode,
  orderId,
  planName,
  amount,
  method,
  checkoutUrl,
  instructions,
  createdAt,
  invitationTitle,
}: {
  mode: "TRIPAY" | "SIMULASI";
  orderId: string;
  planName: string;
  amount: number;
  method: string | null;
  checkoutUrl: string | null;
  instructions?: string;
  createdAt: string;
  invitationTitle?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function simulate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simulasi");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Pesanan {orderId}</h1>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">MENUNGGU PEMBAYARAN</span>
        </div>
        <p className="mt-1 text-xs text-stone-400">Dibuat {createdAt}</p>

        <dl className="mt-6 space-y-2.5 rounded-2xl bg-stone-50 p-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Undangan</dt>
            <dd className="font-medium text-stone-800">{invitationTitle ?? "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Paket</dt>
            <dd className="font-medium text-stone-800">{planName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Metode</dt>
            <dd className="font-medium text-stone-800">{method ?? "-"}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3">
            <dt className="font-semibold text-stone-700">Total</dt>
            <dd className="text-lg font-bold text-brand-600">{formatRupiah(amount)}</dd>
          </div>
        </dl>

        {instructions && (
          <p className="mt-5 rounded-xl bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-600 ring-1 ring-stone-200">
            {instructions}
          </p>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 space-y-3">
          {checkoutUrl && (
            <a
              href={checkoutUrl}
              className="block w-full rounded-xl bg-brand-600 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700"
            >
              Bayar Sekarang
            </a>
          )}
          {mode === "SIMULASI" && (
            <>
              <button
                onClick={simulate}
                disabled={loading}
                className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? "Memproses..." : "▶ Simulasikan Pembayaran Berhasil"}
              </button>
              <p className="rounded-xl bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-700">
                Mode simulasi aktif (kredensial Tripay belum diisi di .env). Klik tombol hijau untuk
                menyelesaikan pembayaran tanpa uang sungguhan — cocok untuk testing alur aktivasi.
              </p>
            </>
          )}
          {mode === "TRIPAY" && !checkoutUrl && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
              Menunggu instruksi pembayaran dari server. Muat ulang halaman ini jika terlalu lama.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs">
          <Link href="/dashboard" className="font-medium text-stone-400 hover:text-brand-600">← Dashboard</Link>
          <span className="text-stone-300">Transaksi diproses oleh Tripay 🔒</span>
        </div>
      </div>
    </main>
  );
}
