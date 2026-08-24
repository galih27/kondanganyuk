"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { inputCls } from "./invitation-editor";

interface GuestRow {
  id: string;
  name: string;
  phone: string | null;
  groupName?: string | null;
}

const DEFAULT_TEMPLATE =
  "Kepada Yth.\n{nama}\n\nAssalamualaikum Warahmatullahi Wabarakatuh.\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara bahagia kami. Berikut tautan undangannya:\n\n{link}\n\nMerupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih \uD83D\uDE4F";

export function GuestsPanel({
  invitationId,
  slug,
  initialTemplate,
}: {
  invitationId: string;
  slug: string;
  initialTemplate: string | null;
}) {
  const [template, setTemplate] = useState(initialTemplate ?? DEFAULT_TEMPLATE);
  const [savedTemplate, setSavedTemplate] = useState(initialTemplate ?? DEFAULT_TEMPLATE);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const notify = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`/api/invitations/${invitationId}/guests`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.guests)) setGuests(d.guests);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [invitationId]);

  function buildMessage(name: string): string {
    const link = `${window.location.origin}/${slug}?to=${encodeURIComponent(name)}`;
    return template.replaceAll("{nama}", name).replaceAll("{link}", link);
  }

  function waHref(g: GuestRow): string | null {
    if (!g.phone) return null;
    return `https://wa.me/${g.phone}?text=${encodeURIComponent(buildMessage(g.name))}`;
  }

  async function addGuests(rows: Array<{ name: string; phone: string }>) {
    const res = await fetch(`/api/invitations/${invitationId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: rows }),
    });
    const d = await res.json();
    if (!res.ok) {
      notify(d.error ?? "Gagal menambah tamu.");
      return;
    }
    setGuests(d.guests);
    notify(`${d.added} tamu ditambahkan.`);
  }

  async function updateGuest(id: string, patch: { name?: string; phone?: string }) {
    const res = await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const d = await res.json();
    if (!res.ok) {
      notify(d.error ?? "Gagal menyimpan.");
      return false;
    }
    setGuests((list) => list.map((g) => (g.id === id ? d.guest : g)));
    return true;
  }

  async function deleteGuest(id: string) {
    const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
    if (!res.ok) {
      notify("Gagal menghapus.");
      return;
    }
    setGuests((list) => list.filter((g) => g.id !== id));
    notify("Tamu dihapus.");
  }

  async function saveTemplate() {
    const res = await fetch(`/api/invitations/${invitationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waTemplate: template }),
    });
    if (!res.ok) {
      notify("Gagal menyimpan template.");
      return;
    }
    setSavedTemplate(template);
    notify("Template pesan disimpan.");
  }

  const bulkRows = useMemo(
    () =>
      bulk
        .split("\n")
        .map((line) => line.split(/[;,]/))
        .filter(([name]) => name?.trim())
        .map(([name, phone]) => ({ name: name.trim(), phone: (phone ?? "").trim() })),
    [bulk]
  );

  return (
    <div className="space-y-8">
      {/* ===== Template pesan WhatsApp ===== */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-stone-800">Template Pesan WhatsApp</h3>
            <p className="mt-0.5 text-xs text-stone-400">
              Gunakan <code className="rounded bg-stone-100 px-1">{"{nama}"}</code> untuk nama tamu dan{" "}
              <code className="rounded bg-stone-100 px-1">{"{link}"}</code> untuk tautan undangan otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={saveTemplate}
            disabled={template === savedTemplate}
            className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            Simpan Template
          </button>
        </div>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={7}
          className={`${inputCls} mt-3 font-mono text-xs leading-relaxed`}
        />
      </section>

      {/* ===== Tambah tamu ===== */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="font-semibold text-stone-800">Tambah Tamu</h3>
        {!showBulk ? (
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama tamu"
              className={`${inputCls} w-56`}
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="No. WA — 62812… / 0812…"
              className={`${inputCls} w-48`}
              inputMode="tel"
            />
            <button
              type="button"
              disabled={!newName.trim()}
              onClick={async () => {
                await addGuests([{ name: newName.trim(), phone: newPhone.trim() }]);
                setNewName("");
                setNewPhone("");
              }}
              className="rounded-xl bg-stone-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              Tambah
            </button>
            <button
              type="button"
              onClick={() => setShowBulk(true)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-stone-500 ring-1 ring-stone-200 transition hover:bg-stone-50"
            >
              Tambah Massal
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={6}
              placeholder={"Satu tamu per baris, pisahkan nama dan nomor dengan ; atau ,\nContoh:\nBudi Santoso; 081234567890\nSiti Aminah, 6281234567891"}
              className={`${inputCls} font-mono text-xs`}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={bulkRows.length === 0}
                onClick={async () => {
                  await addGuests(bulkRows);
                  setBulk("");
                  setShowBulk(false);
                }}
                className="rounded-xl bg-stone-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                Tambah {bulkRows.length || ""} Tamu
              </button>
              <button
                type="button"
                onClick={() => setShowBulk(false)}
                className="text-sm font-medium text-stone-500 hover:text-stone-700"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ===== Daftar tamu ===== */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-800">
            Daftar Tamu <span className="ml-1 text-sm font-normal text-stone-400">({guests.length})</span>
          </h3>
        </div>

        {msg && <p className="mt-3 rounded-xl bg-brand-50 px-4 py-2 text-xs font-medium text-brand-700">{msg}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-stone-400">Memuat…</p>
        ) : guests.length === 0 ? (
          <p className="mt-6 text-sm text-stone-400">Belum ada tamu. Tambahkan di atas — lalu kirim undangannya lewat WhatsApp.</p>
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_auto] items-center gap-x-3 border-b border-stone-200 pb-2 text-[11px] font-bold uppercase tracking-wide text-stone-400 sm:grid-cols-[minmax(0,1fr)_11rem_auto]">
              <span>Nama</span>
              <span>No. WhatsApp</span>
              <span className="pr-1 text-right">Aksi</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {guests.map((g) => (
                <GuestItem key={g.id} guest={g} onUpdate={updateGuest} onDelete={deleteGuest} waHref={waHref(g)} />
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function GuestItem({
  guest,
  onUpdate,
  onDelete,
  waHref,
}: {
  guest: GuestRow;
  onUpdate: (id: string, patch: { name?: string; phone?: string }) => Promise<boolean>;
  onDelete: (id: string) => void;
  waHref: string | null;
}) {
  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState(guest.phone ?? "");
  const dirty = name !== guest.name || phone !== (guest.phone ?? "");

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_6.5rem_auto] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,1fr)_11rem_auto]">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`${inputCls} py-1.5 text-sm`}
        aria-label="Nama tamu"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="—"
        inputMode="tel"
        className={`${inputCls} px-2.5 py-1.5 text-sm`}
        aria-label="Nomor WhatsApp"
      />
      <div className="flex items-center justify-end gap-x-1.5">
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            title="Kirim undangan via WhatsApp"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:brightness-95"
          >
            <WaIcon /> WA
          </a>
        ) : (
          <span
            title="Isi nomor WhatsApp dulu"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-stone-200 px-3 py-1.5 text-xs font-bold text-stone-400"
          >
            <WaIcon /> WA
          </span>
        )}
        <button
          type="button"
          disabled={!dirty}
          onClick={async () => {
            const ok = await onUpdate(guest.id, { name, phone });
            if (!ok) {
              setName(guest.name);
              setPhone(guest.phone ?? "");
            }
          }}
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 transition disabled:cursor-not-allowed disabled:text-stone-300 disabled:ring-stone-200 enabled:text-stone-600 enabled:ring-stone-300 enabled:hover:bg-stone-50"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Hapus tamu "${guest.name}"?`)) onDelete(guest.id);
          }}
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
        >
          Hapus
        </button>
      </div>
    </li>
  );
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.91 9.9 0 1.75.46 3.45 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.45 0 9.9-4.44 9.9-9.9A9.86 9.86 0 0 0 12.04 2Zm5.8 14.15c-.25.7-1.45 1.33-2.02 1.42-.51.08-1.17.11-1.89-.12-.44-.14-1-.32-1.71-.63-3.02-1.3-4.99-4.34-5.14-4.54-.15-.2-1.23-1.63-1.23-3.11 0-1.48.78-2.21 1.05-2.51.27-.3.6-.38.8-.38l.57.01c.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.12 1 2.07 1.31 2.37 1.46.3.15.47.13.65-.08.17-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
    </svg>
  );
}
