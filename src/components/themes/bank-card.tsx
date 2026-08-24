"use client";

import { useState } from "react";

/**
 * Kartu rekening bergaya kartu ATM/debit dengan desain warna sesuai brand
 * bank atau e-wallet masing-masing. Semua gradien dibuat original.
 */

type Brand = {
  display: string;
  from: string;
  to: string;
  text: string;
  accent?: string; // warna khas tambahan (garis/logo kecil)
};

const BRANDS: Record<string, Brand> = {
  // Bank
  bca: { display: "BCA", from: "#0d47a1", to: "#1e88e5", text: "#ffffff", accent: "#ffffff" },
  mandiri: { display: "Mandiri", from: "#002d62", to: "#0a4da2", text: "#ffffff", accent: "#fdb913" },
  bri: { display: "BRI", from: "#003e7e", to: "#0b62c5", text: "#ffffff", accent: "#f37021" },
  bni: { display: "BNI", from: "#c75718", to: "#fa8220", text: "#ffffff", accent: "#ffffff" },
  cimb: { display: "CIMB Niaga", from: "#b71c1c", to: "#ee2e24", text: "#ffffff", accent: "#ffffff" },
  permata: { display: "Permata", from: "#14181d", to: "#37474f", text: "#ffffff", accent: "#26c6da" },
  danamon: { display: "Danamon", from: "#00483c", to: "#00897b", text: "#ffffff", accent: "#aed581" },
  bsi: { display: "BSI", from: "#00504a", to: "#00857a", text: "#ffffff", accent: "#d4af6a" },
  jenius: { display: "Jenius", from: "#c2185b", to: "#ec407a", text: "#ffffff", accent: "#ffffff" },
  jago: { display: "Bank Jago", from: "#17182b", to: "#313552", text: "#ffffff", accent: "#ff9f1c" },
  seabank: { display: "SeaBank", from: "#311b92", to: "#5e35b1", text: "#ffffff", accent: "#ffca28" },
  // E-wallet
  gopay: { display: "GoPay", from: "#00769a", to: "#00aed6", text: "#ffffff", accent: "#00aa13" },
  ovo: { display: "OVO", from: "#34246e", to: "#5b3fa8", text: "#ffffff", accent: "#b39ddb" },
  dana: { display: "DANA", from: "#0364c8", to: "#118eea", text: "#ffffff", accent: "#ffffff" },
  shopeepay: { display: "ShopeePay", from: "#d84315", to: "#ee4d2d", text: "#ffffff", accent: "#ffcc80" },
  shopee: { display: "ShopeePay", from: "#d84315", to: "#ee4d2d", text: "#ffffff", accent: "#ffcc80" },
  linkaja: { display: "LinkAja", from: "#b71c1c", to: "#ef4123", text: "#ffffff", accent: "#ffcdd2" },
};

export const BANK_SUGGESTIONS = [
  "BCA", "Mandiri", "BRI", "BNI", "CIMB Niaga", "Danamon", "Permata", "BSI",
  "Jenius", "Bank Jago", "SeaBank", "GoPay", "OVO", "DANA", "ShopeePay", "LinkAja",
];

function lookup(bank: string): Brand | null {
  const key = bank.toLowerCase().replace(/[^a-z]/g, "");
  if (!key) return null;
  for (const k of Object.keys(BRANDS)) {
    if (key === k || key.includes(k)) return BRANDS[k];
  }
  return null;
}

function formatNumber(raw: string): string {
  const clean = raw.replace(/[\s-]/g, "");
  if (/^\d{8,}$/.test(clean)) return clean.replace(/(.{4})/g, "$1 ").trim();
  return raw;
}

export function BankAtmCard({ bank, number, holder }: { bank: string; number: string; holder: string }) {
  const [copied, setCopied] = useState(false);
  const brand = lookup(bank);
  const b: Brand =
    brand ??
    { display: bank || "Rekening", from: "#26262e", to: "#484854", text: "#ffffff", accent: "#9e9ea8" };
  const pretty = number ? formatNumber(number) : "••••  ••••";

  async function copy() {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* abaikan */
    }
  }

  return (
    <div
      className="relative mx-auto aspect-[1.586] w-full max-w-md overflow-hidden rounded-2xl p-5 shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:rotate-[0.5deg]"
      style={{ background: `linear-gradient(130deg, ${b.from} 0%, ${b.to} 100%)`, color: b.text }}
    >
      {/* dekorasi kartu */}
      <span aria-hidden className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-black/10" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/3 w-16 -skew-x-12 bg-white/10 blur-md"
        style={{ transform: "skewX(-18deg)" }}
      />

      {/* baris atas: nama bank + contactless */}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-base font-extrabold uppercase italic leading-none tracking-wide drop-shadow-sm">{b.display}</p>
          <span className="mt-1 block h-1 w-8 rounded-full" style={{ background: b.accent ?? "rgba(255,255,255,.6)" }} />
        </div>
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 opacity-80" aria-hidden>
          <path d="M6 9a9 9 0 0 1 0 6M10 7a12 12 0 0 1 0 10M14 5a15 15 0 0 1 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>

      {/* chip + nomor */}
      <div className="relative mt-4 flex items-center gap-3">
        <svg viewBox="0 0 44 32" className="h-7 w-10 shrink-0 drop-shadow" aria-hidden>
          <defs>
            <linearGradient id="chipGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3d98b" />
              <stop offset=".55" stopColor="#caa64f" />
              <stop offset="1" stopColor="#a8842e" />
            </linearGradient>
          </defs>
          <rect width="44" height="32" rx="6" fill="url(#chipGold)" />
          <path d="M0 12h13M0 20h13M31 12h13M31 20h13M13 12v8h18v-8M22 0v12M22 20v12" stroke="rgba(60,42,8,.45)" strokeWidth="1.4" fill="none" />
        </svg>
        <p className="truncate font-mono text-lg font-semibold tracking-[0.14em] drop-shadow-sm sm:text-xl">{pretty}</p>
      </div>

      {/* baris bawah: pemilik + salin */}
      <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {holder && (
            <>
              <p className="text-[9px] uppercase tracking-[0.25em] opacity-70">Card Holder</p>
              <p className="truncate text-sm font-bold uppercase tracking-wider drop-shadow-sm">{holder}</p>
            </>
          )}
        </div>
        <button
          onClick={copy}
          disabled={!number}
          className="shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold backdrop-blur transition hover:bg-white/25 active:scale-95 disabled:opacity-50"
          style={{ borderColor: `${b.text}66`, background: copied ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.14)", color: copied ? "#1a1a1a" : b.text }}
        >
          {copied ? "✓ Tersalin" : "Salin No."}
        </button>
      </div>
    </div>
  );
}
