"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  ok: boolean;
  name?: string;
  groupName?: string | null;
  message: string;
}

export function CheckinClient({
  invitationId,
  title,
  plan,
  initialStats,
}: {
  invitationId: string;
  title: string;
  plan: string;
  initialStats: { total: number; checkedInCount: number };
}) {
  const qrEnabled = plan === "PREMIUM" || plan === "BASIC";
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [stats, setStats] = useState(initialStats);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function refreshStats() {
    const res = await fetch(`/api/invitations/${invitationId}/checkin`);
    if (res.ok) {
      const json = await res.json();
      setStats({ total: json.total as number, checkedInCount: json.checkedInCount as number });
    }
  }

  async function submitToken(token: string) {
    if (!token.trim()) return;
    try {
      const res = await fetch(`/api/invitations/${invitationId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: token.trim() }),
      });
      const json = await res.json();
      setResults((r) => [
        { ok: res.ok && json.ok !== false, name: json.name, message: json.message ?? (json.ok ? `${json.name} berhasil check-in ✓` : json.error) },
        ...r.slice(0, 9),
      ]);
      refreshStats();
    } catch {
      setResults((r) => [{ ok: false, message: "Gagal terhubung ke server." }, ...r]);
    }
  }

  async function startScanner() {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          submitToken(decodedText);
          // beri jeda agar tidak dobel-scan token yang sama
          setTimeout(() => {}, 800);
        },
        () => {}
      );
      setScanning(true);
    } catch {
      alert("Tidak dapat mengakses kamera. Pastikan izinkan kamera di browser atau gunakan input manual.");
      stopScanner();
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/dashboard/undangan/${invitationId}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50 active:scale-[0.98]"
      >
        <span aria-hidden>←</span> Kembali ke Editor
      </Link>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">QR Check-in Tamu</h1>
      <p className="mt-1 text-sm text-stone-500">{title}</p>

      {!qrEnabled ? (
        <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-4xl">🔒</p>
          <h2 className="mt-3 font-semibold text-stone-800">Fitur paket Basic &amp; Premium</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-500">
            Upgrade paket undangan ini untuk membuka layar check-in tamu dengan QR code.
          </p>
          <Link href={`/dashboard/undangan/${invitationId}?bayar=1`} className="mt-5 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
            Lihat Paket
          </Link>
        </div>
      ) : (
        <>
          {/* Statistik */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">Total tamu</p>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{stats.checkedInCount}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">Sudah hadir</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-stone-900">
                {Math.max(0, stats.total - stats.checkedInCount)}
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400">Belum hadir</p>
            </div>
          </div>

          {/* Scanner */}
          <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">Pindai QR tamu</h2>
              {scanning ? (
                <button onClick={stopScanner} className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600">
                  Hentikan Kamera
                </button>
              ) : (
                <button onClick={startScanner} className="rounded-full bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700">
                  Buka Kamera
                </button>
              )}
            </div>
            {scanning && <div id="qr-reader" className="mx-auto mt-4 w-full max-w-xs overflow-hidden rounded-2xl border border-stone-200" />}
            <div className="mt-4 flex gap-2">
              <input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (submitToken(manualInput), setManualInput(""))}
                placeholder="Atau ketik nama / token tamu untuk check-in manual"
                className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              <button
                onClick={() => { submitToken(manualInput); setManualInput(""); }}
                className="rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Check-in
              </button>
            </div>
          </div>

          {/* Hasil */}
          {results.length > 0 && (
            <ul className="mt-6 space-y-2">
              {results.map((r, i) => (
                <li
                  key={i}
                  className={`anim-fade-in flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm ${
                    r.ok ? "bg-green-50 text-green-800 ring-1 ring-green-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"
                  }`}
                >
                  <span>{r.ok ? "✓" : "⚠️"}</span>
                  <span className="font-medium">{r.message}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
