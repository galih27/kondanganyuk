"use client";

import { useState } from "react";
import Link from "next/link";

interface GuestItem {
  id: string;
  name: string;
  groupName: string | null;
  qrToken: string;
  checkedInAt: string | null;
}

export function GuestManager({
  invitationId,
  slug,
  title,
  initialGuests,
}: {
  invitationId: string;
  slug: string;
  title: string;
  initialGuests: GuestItem[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [bulkText, setBulkText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function refreshList() {
    const res = await fetch(`/api/invitations/${invitationId}/guests`);
    if (res.ok) {
      const json = await res.json();
      setGuests(json.guests);
    }
  }

  async function addBulk() {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulkText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah tamu");
      setMessage(`${json.added} tamu ditambahkan ✓ (total ${json.total})`);
      setBulkText("");
      await refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  async function removeGuest(guestId: string) {
    setBusy(true);
    await fetch(`/api/invitations/${invitationId}/guests?guestId=${guestId}`, { method: "DELETE" });
    await refreshList();
    setBusy(false);
  }

  function personalLink(name: string) {
    return `${origin}/${slug}?to=${encodeURIComponent(name)}`;
  }

  function waShare(g: GuestItem) {
    const text = `Assalamu'alaikum Bapak/Ibu/Saudara/i *${g.name}*,\n\nDengan penuh rasa syukur, kami mengundang ${g.name} untuk hadir pada acara "${title}".\n\nDetail undangan dapat dilihat di:\n${personalLink(g.name)}\n\nMerupakan suatu kehormatan apabila ${g.name} berkenan untuk hadir. Terima kasih 🙏`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* abaikan */ }
  }

  const filtered = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.groupName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Link
        href={`/dashboard/undangan/${invitationId}`}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50 active:scale-[0.98]"
      >
        <span aria-hidden>←</span> Kembali ke Editor
      </Link>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Daftar Tamu</h1>
        <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold text-stone-600">{guests.length} tamu</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Tambah massal */}
        <div className="h-fit rounded-3xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-800">Tambah tamu massal</h2>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">
            Satu nama per baris. Format opsional <code className="rounded bg-stone-100 px-1">Nama | Grup</code> —
            cth: <em>Bapak Budi | Keluarga</em>. Setiap tamu otomatis mendapat QR &amp; link personal.
          </p>
          {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {message && <p className="anim-fade-in mt-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
          <textarea
            rows={10}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Bapak Budi | Keluarga\nIbu Sari | Teman Kantor\nRaka & Pasangan | Sahabat Kuliah"}
            className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-stone-300"
          />
          <button
            onClick={addBulk}
            disabled={busy || !bulkText.trim()}
            className="mt-3 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? "Menyimpan..." : "Tambahkan Tamu"}
          </button>
        </div>

        {/* Daftar tamu */}
        <div className="min-w-0 rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau grup..."
              className="w-full max-w-xs rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-stone-400">Belum ada tamu{search && " yang cocok"}.</p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100">
              {filtered.map((g) => (
                <li key={g.id} className="py-4 first:pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-stone-800">
                        {g.name}
                        {g.checkedInAt && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">✓ CHECK-IN</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-400">{g.groupName ?? "Tanpa grup"}</p>
                      <button
                        onClick={() => copy(personalLink(g.name), g.id)}
                        className="mt-1 break-all text-left text-xs text-brand-600 hover:text-brand-700"
                        title="Klik untuk salin link personal"
                      >
                        /{slug}?to={encodeURIComponent(g.name)} {copiedId === g.id && "· tersalin!"}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 sm:mt-0 sm:shrink-0">
                      <a
                        href={waShare(g)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-green-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-green-600"
                      >
                        Kirim WA
                      </a>
                      <button
                        onClick={() => removeGuest(g.id)}
                        disabled={busy}
                        className="rounded-full px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
