"use client";

import { useState } from "react";
import type { ThemePalette } from "@/lib/themes";
import { formatDateID } from "@/lib/utils";
import type { WishPublic } from "./invitation-view";

const OPTIONS = [
  { value: "HADIR", label: "Saya akan hadir 🙌" },
  { value: "MASIH_RAGU", label: "Masih ragu 🤔" },
  { value: "BERHALANGAN", label: "Berhalangan 😢" },
];

export function RsvpSection({
  slug,
  theme,
  hFont,
  bodyFont,
  guestName,
  initialWishes,
}: {
  slug: string;
  theme: { palette: ThemePalette; surface?: string; dark: boolean };
  hFont: string;
  bodyFont: string;
  guestName: string;
  initialWishes: WishPublic[];
}) {
  const p = theme.palette;
  const [name, setName] = useState(guestName);
  const [attendance, setAttendance] = useState("HADIR");
  const [message, setMessage] = useState("");
  const [wishes, setWishes] = useState(initialWishes);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, attendance, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengirim");
      setWishes((w) => [json.wish, ...w]);
      setMessage("");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setStatus("idle");
    }
  }

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto mb-3 block h-px w-14" style={{ background: p.accent }} />
          <h2 className={`${hFont} text-3xl`} style={{ color: p.text }}>Ucapan &amp; Doa</h2>
          <p className={`${bodyFont} mt-3 text-sm leading-relaxed`} style={{ color: p.textMuted }}>
            Konfirmasi kehadiran dan tinggalkan doa terbaik untuk kami.
          </p>
          <span className="mx-auto mt-3 block h-px w-14" style={{ background: p.accent }} />
        </div>

        {/* Rekap kehadiran */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { n: wishes.filter((w) => w.attendance === "HADIR").length, label: "Berencana hadir", c: "#15803d" },
            { n: wishes.filter((w) => w.attendance === "MASIH_RAGU").length, label: "Masih ragu", c: "#b45309" },
            { n: wishes.filter((w) => w.attendance === "BERHALANGAN").length, label: "Berhalangan", c: "#dc2626" },
          ].map((r) => (
            <div key={r.label} className="rounded-2xl border p-4 text-center" style={{ borderColor: `${p.accent}33`, background: theme.surface ?? theme.palette.surface }}>
              <p className="text-2xl font-extrabold" style={{ color: r.c }}>{r.n}</p>
              <p className={`${bodyFont} mt-1 text-[11px] leading-tight`} style={{ color: p.textMuted }}>{r.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mt-10 space-y-4 rounded-3xl border p-6 shadow-sm" style={{ borderColor: `${p.accent}33`, background: theme.surface ?? theme.palette.surface }}>
          {error && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "#fee2e2", color: "#b91c1c" }}>{error}</p>
          )}
          {status === "sent" && (
            <p className="anim-fade-in rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
              Terima kasih! Ucapan Anda sudah terkirim 🤍
            </p>
          )}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            maxLength={60}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
            style={{ borderColor: `${p.accent}44`, background: p.bg, color: p.text }}
          />
          <select
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{ borderColor: `${p.accent}44`, background: p.bg, color: p.text }}
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {["🥳", "❤️", "🙏", "🎉", "🤍", "🤲", "✨", "😭"].map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setMessage((m) => (m + e).slice(0, 500))}
                className="rounded-full px-2 py-0.5 text-lg transition hover:scale-110"
                style={{ background: `${p.accent}14` }}
                aria-label={`Tambah ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tuliskan ucapan & doa..."
            maxLength={500}
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition"
            style={{ borderColor: `${p.accent}44`, background: p.bg, color: p.text }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl py-3.5 text-sm font-bold transition hover:opacity-85 disabled:opacity-60"
            style={{ background: p.accent, color: theme.dark ? "#141210" : "#fff" }}
          >
            {status === "sending" ? "Mengirim..." : "Kirim Ucapan"}
          </button>
        </form>

        {/* Dinding ucapan */}
        <div className="mt-8 max-h-[480px] space-y-4 overflow-y-auto pr-1 thin-scroll">
          {wishes.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: p.textMuted }}>
              Jadilah yang pertama mengirim ucapan ✨
            </p>
          ) : (
            wishes.map((w) => (
              <article key={w.id} className="rounded-2xl border p-5" style={{ borderColor: `${p.accent}22`, background: theme.surface ?? theme.palette.surface }}>
                <header className="flex items-center justify-between gap-3">
                  <p className="font-semibold" style={{ color: p.text }}>{w.guestName}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      w.attendance === "HADIR" ? "bg-green-100 text-green-700" : w.attendance === "BERHALANGAN" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {w.attendance === "HADIR" ? "Hadir" : w.attendance === "BERHALANGAN" ? "Berhalangan" : "Ragu"}
                  </span>
                </header>
                <p className={`${bodyFont} mt-2 whitespace-pre-wrap text-sm leading-relaxed`} style={{ color: p.textMuted }}>
                  {w.message}
                </p>
                {w.reply && (
                  <div className="mt-3 rounded-xl p-3" style={{ background: `${p.accent}14` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: p.accent }}>Balasan</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: p.text }}>{w.reply}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// helper dipakai ulang untuk tanggal (jika perlu di masa depan)
export function _fmt(d: string) {
  return formatDateID(d);
}
