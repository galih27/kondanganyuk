"use client";

import { useState } from "react";

export type CollabUser = { id: string; name: string; email: string };
type Collaborator = { id: string; user: CollabUser };

export function ManageCollaboratorsButton({
  invitationId,
  ownerId,
  users,
}: {
  invitationId: string;
  ownerId: string;
  users: CollabUser[];
}) {
  const [open, setOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/invitations/${invitationId}/collaborators`);
    if (res.ok) {
      const json = await res.json();
      setCollaborators(json.collaborators ?? []);
    }
  }

  async function openModal() {
    setError(null);
    setOpen(true);
    await load();
  }

  const available = users.filter(
    (u) => u.id !== ownerId && !collaborators.some((c) => c.user?.id === u.id)
  );

  async function add() {
    if (!selected) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/invitations/${invitationId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menambah kolaborator");
      setSelected("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  async function remove(collaboratorId: string) {
    setBusy(true);
    setError(null);
    try {
      await fetch(`/api/admin/invitations/${invitationId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId }),
      });
      await load();
    } catch {
      setError("Gagal menghapus kolaborator");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="rounded-full border border-stone-700 px-4 py-2 text-xs font-semibold text-stone-300 transition hover:border-stone-500 hover:bg-stone-800"
        title="Tambahkan akun lain sebagai kolaborator undangan"
      >
        Kolaborator
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
            <h3 className="text-lg font-bold text-stone-100">Kelola Kolaborator</h3>
            <p className="mt-1 text-sm text-stone-400">
              Kolaborator dapat mengelola undangan ini dari dashboard mereka sendiri.
            </p>

            {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

            {/* Daftar kolaborator */}
            <div className="mt-4 space-y-2">
              {collaborators.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-700 p-4 text-center text-xs text-stone-500">
                  Belum ada kolaborator.
                </p>
              ) : (
                collaborators.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-800/50 p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400">
                      {(c.user?.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-100">{c.user?.name}</p>
                      <p className="truncate text-xs text-stone-400">{c.user?.email}</p>
                    </div>
                    <button
                      onClick={() => remove(c.id)}
                      disabled={busy}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Tambah kolaborator */}
            <div className="mt-4 border-t border-stone-800 pt-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Tambah kolaborator
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2.5 text-sm text-stone-100 outline-none focus:border-brand-500"
                >
                  <option value="">— Pilih user —</option>
                  {available.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={add}
                  disabled={busy || !selected}
                  className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-400 transition hover:bg-stone-800 hover:text-stone-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
