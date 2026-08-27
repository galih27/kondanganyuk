"use client";

import { useState } from "react";

export type TransferUser = { id: string; name: string; email: string };

export function TransferOwnerButton({
  invitationId,
  currentOwner,
  users,
}: {
  invitationId: string;
  currentOwner: string;
  users: TransferUser[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = users.filter((u) => u.id !== currentOwner);

  async function transfer() {
    if (!selected) return;
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/transfer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memindahkan undangan");
      setMessage("Undangan berhasil dipindahkan ✓");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-stone-700 px-4 py-2 text-xs font-semibold text-stone-300 transition hover:border-stone-500 hover:bg-stone-800"
        title="Pindahkan kepemilikan undangan ke user lain"
      >
        Pindah Pemilik
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-stone-100">Pindahkan Pemilik Undangan</h3>
            <p className="mt-1 text-sm text-stone-400">
              Undangan akan berpindah sepenuhnya ke user tujuan.
            </p>

            {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}
            {message && <p className="anim-fade-in mt-3 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400">{message}</p>}

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Pilih user tujuan
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 outline-none focus:border-brand-500"
            >
              <option value="">— Pilih user —</option>
              {options.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-400 transition hover:bg-stone-800 hover:text-stone-200"
              >
                Batal
              </button>
              <button
                onClick={transfer}
                disabled={busy || !selected}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {busy ? "Memindahkan..." : "Pindahkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
