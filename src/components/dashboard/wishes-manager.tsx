"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDateTimeID } from "@/lib/utils";

interface WishItem {
  id: string;
  guestName: string;
  attendance: string;
  message: string;
  reply: string | null;
  createdAt: string;
}

const ATTENDANCE_LABEL: Record<string, { label: string; cls: string }> = {
  HADIR: { label: "Hadir", cls: "bg-green-100 text-green-700" },
  BERHALANGAN: { label: "Berhalangan", cls: "bg-red-100 text-red-600" },
  MASIH_RAGU: { label: "Masih ragu", cls: "bg-amber-100 text-amber-700" },
};

export function WishesManager({ invitationId, title, initialWishes }: { invitationId: string; title: string; initialWishes: WishItem[] }) {
  const [wishes, setWishes] = useState(initialWishes);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const counts = {
    ALL: wishes.length,
    HADIR: wishes.filter((w) => w.attendance === "HADIR").length,
    BERHALANGAN: wishes.filter((w) => w.attendance === "BERHALANGAN").length,
    MASIH_RAGU: wishes.filter((w) => w.attendance === "MASIH_RAGU").length,
  };

  async function submitReply(wishId: string) {
    if (!replyText.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/wishes/${wishId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.ok) {
        setWishes((ws) =>
          ws.map((w) => (w.id === wishId ? { ...w, reply: replyText.trim() } : w))
        );
        setReplyTo(null);
        setReplyText("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function removeWish(wishId: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/wishes/${wishId}`, { method: "DELETE" });
      if (res.ok) setWishes((ws) => ws.filter((w) => w.id !== wishId));
    } finally {
      setBusy(false);
    }
  }

  const shown = filter === "ALL" ? wishes : wishes.filter((w) => w.attendance === filter);

  return (
    <div>
      <Link
        href={`/dashboard/undangan/${invitationId}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50 active:scale-[0.98]"
      >
        <span aria-hidden>←</span> Kembali ke Editor
      </Link>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">Ucapan &amp; RSVP</h1>
      <p className="mt-1 text-sm text-stone-500">{title} — balas doa tamu untuk kesan yang lebih personal.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["ALL", "HADIR", "MASIH_RAGU", "BERHALANGAN"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f ? "bg-stone-800 text-white shadow" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
            }`}
          >
            {f === "ALL" ? `Semua (${counts.ALL})` : `${ATTENDANCE_LABEL[f].label} (${counts[f]})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-4xl">🙏</p>
          <p className="mt-3 text-sm text-stone-500">Belum ada ucapan{filter !== "ALL" ? " dengan status ini" : ""}.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((w) => {
            const att = ATTENDANCE_LABEL[w.attendance] ?? ATTENDANCE_LABEL.HADIR;
            return (
              <li key={w.id} className="rounded-3xl border border-stone-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                      {w.guestName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-800">{w.guestName}</p>
                      <p className="text-xs text-stone-400">{formatDateTimeID(new Date(w.createdAt))}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${att.cls}`}>{att.label}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">{w.message}</p>

                {w.reply ? (
                  <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Balasan Anda</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">{w.reply}</p>
                    <button onClick={() => { setReplyTo(w.id); setReplyText(w.reply ?? ""); }} className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700">
                      Ubah balasan
                    </button>
                  </div>
                ) : replyTo === w.id ? (
                  <div className="mt-4">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Terima kasih ${w.guestName}...`}
                      className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                    />
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => submitReply(w.id)} disabled={busy || !replyText.trim()} className="rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50">
                        Kirim Balasan
                      </button>
                      <button onClick={() => setReplyTo(null)} className="rounded-full px-5 py-2 text-xs font-medium text-stone-500 hover:bg-stone-100">
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setReplyTo(w.id); setReplyText(""); }} className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700">
                    ↩︎ Balas ucapan ini
                  </button>
                )}

                <div className="mt-3 flex justify-end">
                  <button onClick={() => removeWish(w.id)} disabled={busy} className="text-xs font-medium text-red-400 transition hover:text-red-600">
                    Hapus
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
