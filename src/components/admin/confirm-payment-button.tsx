"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmPaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!window.confirm("Konfirmasi pembayaran ini dan aktifkan undangan terkait?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/confirm`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengonfirmasi");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="rounded-full bg-green-600 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "✓ Konfirmasi & Aktifkan"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
