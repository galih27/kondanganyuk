"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { InvitationData } from "@/lib/invitation-data";
import { CATEGORY_LABELS } from "@/lib/invitation-data";
import { THEMES, getTheme, HEADING_FONT_OPTIONS, SECTION_KEYS, SECTION_LABELS, type SectionKey, type SectionStyle, type ThemeArt, type ThemePalette } from "@/lib/themes";
import { PLANS } from "@/lib/plans";
import { EDITOR_TABS, normalizeTab, type EditorTabId } from "@/lib/editor-tabs";
import { GuestsPanel } from "./guests-panel";
import { formatRupiah, slugify, formatDateID } from "@/lib/utils";
import { UploadZone } from "./uploader";
import { BANK_SUGGESTIONS } from "@/components/themes/bank-card";
import { ThemePreviewCard } from "@/components/marketing/theme-preview-card";

export interface EditorInvitation {
  id: string;
  slug: string;
  category: string;
  themeId: string;
  themeArt: string | null;
  themePalette: string | null;
  waTemplate: string | null;
  ogImage: string | null;
  title: string;
  status: string;
  plan: string;
  views: number;
  activatedUntil: string | null;
  data: InvitationData;
  wishCount: number;
  guestCount: number;
  lastPaymentStatus: string | null;
  lastOrderId: string | null;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-stone-300";

type ArtSlot = "theme" | "none" | "floral-corner" | "corner-expanded" | "balloon-border" | "calligraphy-frame" | "gunung-silhouette";
const ORNAMENT_SLOT_LABELS: Record<Exclude<ArtSlot, "theme">, string> = {
  none: "Tanpa",
  "floral-corner": "Sudut bunga",
  "corner-expanded": "Arabesque",
  "balloon-border": "Balon",
  "calligraphy-frame": "Kaligrafi",
  "gunung-silhouette": "Gunungan",
};

const PALETTE_PRESETS = [
  { name: "Emas klasik", accent: "#d4af6a", accent2: "#8a6f3f" },
  { name: "Rose lembut", accent: "#d97a8c", accent2: "#b45268" },
  { name: "Sage tenang", accent: "#7c9070", accent2: "#55684c" },
  { name: "Zamrud syar'i", accent: "#1f7a5c", accent2: "#c9a227" },
  { name: "Biru senja", accent: "#8fa8ff", accent2: "#5f74d6" },
  { name: "Terakota hangat", accent: "#c96f4a", accent2: "#8a4a30" },
];

const PALETTE_FIELDS: [keyof ThemePalette, string][] = [
  ["accent", "Aksen utama"],
  ["accent2", "Aksen kedua"],
  ["bg", "Latar halaman"],
  ["surface", "Latar kartu"],
  ["text", "Warna teks"],
  ["textMuted", "Teks redup"],
];

function OrnamentSlotPicker({ label, hint, value, options, onChange }: {
  label: string;
  hint?: string;
  value: ArtSlot;
  options: Exclude<ArtSlot, "theme" | "none">[];
  onChange: (v: ArtSlot) => void;
}) {
  const all: ArtSlot[] = ["theme", "none", ...options];
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {all.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              value === v ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100" : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {v === "theme" ? "Ikut tema" : ORNAMENT_SLOT_LABELS[v]}
          </button>
        ))}
      </div>
      {hint && <p className="mt-1.5 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export function InvitationEditor({ initial }: { initial: EditorInvitation }) {
  const [form, setForm] = useState<InvitationData>(initial.data);
  const [themeId, setThemeId] = useState(initial.themeId);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [ogImage, setOgImage] = useState<string | null>(initial.ogImage);

  // ===== Pengaturan tema kustom (ornamen & palet) =====
  const initialArtSlots: Record<"corners" | "backdrop" | "frame", ArtSlot> = (() => {
    try {
      if (initial.themeArt) {
        const a = JSON.parse(initial.themeArt) as ThemeArt;
        return {
          corners: (a.corners as ArtSlot) ?? "none",
          backdrop: (a.backdrop as ArtSlot) ?? "none",
          frame: (a.frame as ArtSlot) ?? "none",
        };
      }
    } catch { /* abaikan */ }
    return { corners: "theme", backdrop: "theme", frame: "theme" };
  })();
  const initialCloudsOpacity: number | null = (() => {
    try {
      if (initial.themeArt) {
        const a = JSON.parse(initial.themeArt) as ThemeArt;
        return typeof a.cloudsOpacity === "number" ? Math.min(100, Math.max(0, a.cloudsOpacity)) : null;
      }
    } catch { /* abaikan */ }
    return null;
  })();
  const initialPalOverride: Partial<ThemePalette> | null = (() => {
    try { return initial.themePalette ? JSON.parse(initial.themePalette) : null; } catch { return null; }
  })();
  const initialSecStyles: Partial<Record<SectionKey, SectionStyle>> = (() => {
    try {
      if (initial.themeArt) {
        const a = JSON.parse(initial.themeArt) as ThemeArt;
        return a.sectionStyles ?? {};
      }
    } catch { /* abaikan */ }
    return {};
  })();

  const [artSlots, setArtSlots] = useState(initialArtSlots);
  const [cloudsOpacity, setCloudsOpacity] = useState<number | null>(initialCloudsOpacity);
  const [secStyles, setSecStyles] = useState<Partial<Record<SectionKey, SectionStyle>>>(initialSecStyles);
  const [palEnabled, setPalEnabled] = useState(!!initialPalOverride);
  const [palColors, setPalColors] = useState<ThemePalette>({
    ...getTheme(initial.themeId).palette,
    ...(initialPalOverride ?? {}),
  });

  const baseTheme = getTheme(themeId);
  function resolveArt(): ThemeArt {
    const out: ThemeArt = {};
    const pick = (slot: ArtSlot, key: "corners" | "backdrop" | "frame"): string | undefined => {
      if (slot === "theme") return baseTheme.art?.[key];
      if (slot === "none") return undefined;
      return slot;
    };
    const c = pick(artSlots.corners, "corners");
    const b = pick(artSlots.backdrop, "backdrop");
    const f = pick(artSlots.frame, "frame");
    if (c) out.corners = c;
    if (b) out.backdrop = b;
    if (f) out.frame = f;
    if (typeof cloudsOpacity === "number") out.cloudsOpacity = cloudsOpacity;
    const secEntries = Object.entries(secStyles).filter(([, v]) => v && Object.values(v).some((x) => x !== undefined && x !== "" && x !== 100));
    if (secEntries.length > 0) out.sectionStyles = Object.fromEntries(secEntries) as ThemeArt["sectionStyles"];
    return out;
  }
  const effectivePalette: ThemePalette = palEnabled ? palColors : baseTheme.palette;
  function chooseTheme(id: string) {
    setThemeId(id);
    setArtSlots({ corners: "theme", backdrop: "theme", frame: "theme" });
    setCloudsOpacity(null);
    setSecStyles({});
    setPalEnabled(false);
    setPalColors({ ...getTheme(id).palette });
  }
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Tab aktif disimpan di query ?tab= — juga dipakai sidebar utama.
  const tab: EditorTabId = normalizeTab(params.get("tab"));
  function setTab(id: EditorTabId) {
    const p = new URLSearchParams(params.toString());
    p.set("tab", id);
    router.replace(`${pathname}?${p}`, { scroll: false });
  }

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const isWedding = initial.category === "WEDDING";
  const set = <K extends keyof InvitationData>(key: K, value: InvitationData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const previewHref = `/${initial.slug}`;

  async function save() {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const res = await fetch(`/api/invitations/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: form,
          themeId,
          title,
          slug,
          themeArt: JSON.stringify(resolveArt()),
          themePalette: palEnabled ? JSON.stringify(palColors) : null,
          ogImage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      setSavedMsg("Perubahan tersimpan ✓");
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  async function checkSlug(value: string) {
    if (!value) return setSlugStatus(null);
    try {
      const res = await fetch(`/api/invitations/check-slug?slug=${encodeURIComponent(value)}&current=${initial.slug}`);
      const json = await res.json();
      setSlugStatus({
        ok: json.available || json.slug === slugify(initial.slug),
        msg: json.available ? `✓ /${json.slug ?? slugify(value)} tersedia` : `✕ ${json.reason ?? "Link sudah dipakai"}`,
      });
    } catch {
      /* diamkan */
    }
  }

  // ---- Events helpers ----
  function updateEvent(idx: number, patch: Partial<InvitationData["events"][number]>) {
    set("events", form.events.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  }

  // ---- Gallery helpers ----
  const [newImageUrl, setNewImageUrl] = useState("");

  // Hapus berkas dari database bila item yang dibuang adalah hasil unggahan.
  async function discardUpload(url: string) {
    const m = /^\/api\/media\/([a-zA-Z0-9_-]+)$/.exec(url);
    if (!m) return;
    try {
      await fetch(`/api/media/${m[1]}`, { method: "DELETE" });
    } catch {
      /* diamkan — berkas yatim bisa dibersihkan nanti */
    }
  }

  // ---- Bank helpers ----
  function updateBank(idx: number, patch: Partial<InvitationData["banks"][number]>) {
    set("banks", form.banks.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  const statusInfo = useMemo(() => {
    switch (initial.status) {
      case "ACTIVE":
        return { cls: "bg-green-50 text-green-700 border-green-200", label: "AKTIF", desc: initial.activatedUntil ? `Berlaku hingga ${formatDateID(initial.activatedUntil)}` : "" };
      case "PENDING":
        return { cls: "bg-amber-50 text-amber-700 border-amber-200", label: "MENUNGGU PEMBAYARAN", desc: "Selesaikan pembayaran untuk mengaktifkan." };
      case "EXPIRED":
        return { cls: "bg-red-50 text-red-600 border-red-200", label: "KEDALUWARSA", desc: "Perpanjang dengan upgrade paket." };
      default:
        return { cls: "bg-stone-100 text-stone-600 border-stone-200", label: "DRAF", desc: "Simpan konten lalu aktifkan saat siap disebar." };
    }
  }, [initial.status, initial.activatedUntil]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50 active:scale-[0.98]"
          >
            <span aria-hidden>←</span> Daftar Undangan
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full max-w-md rounded-lg bg-transparent text-2xl font-bold tracking-tight text-stone-900 outline-none transition hover:bg-stone-100 focus:bg-stone-100 px-2 py-1"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 px-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.cls}`}>{statusInfo.label}</span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-500">{CATEGORY_LABELS[initial.category]}</span>
            <span className="text-xs text-stone-400">👀 {initial.views}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedMsg && <span className="anim-fade-in text-sm font-medium text-green-600">{savedMsg}</span>}
          {error && <span className="text-sm font-medium text-red-600">{error}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Kolom utama */}
        <div className="min-w-0">
          {/* Pemilih bagian untuk layar kecil — di desktop memakai sidebar utama */}
          <div className="thin-scroll -mx-1 mb-5 flex gap-1 overflow-x-auto pb-1 lg:hidden" role="tablist">
            {EDITOR_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "true" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === t.id ? "bg-stone-800 text-white shadow" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-5 rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
            {/* ===== KONTEN ===== */}
            {tab === "konten" && (
              <>
                {isWedding ? (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-4 rounded-2xl bg-brand-50/50 p-5">
                      <h3 className="font-semibold text-stone-800">🤵 Mempelai Pria</h3>
                      <Field label="Nama panggilan"><input value={form.groomName} onChange={(e) => set("groomName", e.target.value)} className={inputCls} placeholder="Hendra" /></Field>
                      <Field label="Nama lengkap"><input value={form.groomFull} onChange={(e) => set("groomFull", e.target.value)} className={inputCls} placeholder="Hendra Kusuma, S.T." /></Field>
                      <Field label="Putra dari"><input value={form.groomParents} onChange={(e) => set("groomParents", e.target.value)} className={inputCls} placeholder="Bpk. Sutrisno &amp; Ibu Wati" /></Field>
                      <Field label="Foto mempelai pria">
                        <div className="flex items-center gap-3">
                          {form.groomPhoto && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={form.groomPhoto} alt="Foto mempelai pria" className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-stone-200" />
                          )}
                          <div className="min-w-0 flex-1">
                            <UploadZone accept="image/*" icon="🤵" label={form.groomPhoto ? "Ganti foto" : "Unggah foto"} hint="Potret untuk seksi Mempelai." onUploaded={(urls) => set("groomPhoto", urls[0])} />
                            {form.groomPhoto && (
                              <button onClick={() => set("groomPhoto", "")} className="mt-1 text-xs font-medium text-red-500 hover:text-red-600">Hapus foto</button>
                            )}
                          </div>
                        </div>
                      </Field>
                    </div>
                    <div className="space-y-4 rounded-2xl bg-pink-50/50 p-5">
                      <h3 className="font-semibold text-stone-800">👰 Mempelai Wanita</h3>
                      <Field label="Nama panggilan"><input value={form.brideName} onChange={(e) => set("brideName", e.target.value)} className={inputCls} placeholder="Dinda" /></Field>
                      <Field label="Nama lengkap"><input value={form.brideFull} onChange={(e) => set("brideFull", e.target.value)} className={inputCls} placeholder="Dinda Ayu Lestari, S.Pd." /></Field>
                      <Field label="Putri dari"><input value={form.brideParents} onChange={(e) => set("brideParents", e.target.value)} className={inputCls} placeholder="Bpk. Joko &amp; Ibu Sri" /></Field>
                      <Field label="Foto mempelai wanita">
                        <div className="flex items-center gap-3">
                          {form.bridePhoto && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={form.bridePhoto} alt="Foto mempelai wanita" className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-stone-200" />
                          )}
                          <div className="min-w-0 flex-1">
                            <UploadZone accept="image/*" icon="👰" label={form.bridePhoto ? "Ganti foto" : "Unggah foto"} hint="Potret untuk seksi Mempelai." onUploaded={(urls) => set("bridePhoto", urls[0])} />
                            {form.bridePhoto && (
                              <button onClick={() => set("bridePhoto", "")} className="mt-1 text-xs font-medium text-red-500 hover:text-red-600">Hapus foto</button>
                            )}
                          </div>
                        </div>
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <Field label={`Nama ${CATEGORY_LABELS[initial.category]?.toLowerCase() ?? ""}`} hint="Nama yang dirayakan pada acara ini.">
                      <input value={form.personName} onChange={(e) => set("personName", e.target.value)} className={inputCls} placeholder="cth: Aksa Ramadhan" />
                    </Field>
                    <Field label="Detail tambahan" hint="cth: Putra kedua dari Bpk. X &amp; Ibu Y, atau deskripsi singkat acara.">
                      <input value={form.personDetail} onChange={(e) => set("personDetail", e.target.value)} className={inputCls} />
                    </Field>
                  </div>
                )}
                <Field label="Catatan penutup" hint="Kalimat penutup atau ucapan terima kasih di bagian bawah undangan.">
                  <textarea rows={3} value={form.closingNote} onChange={(e) => set("closingNote", e.target.value)} className={inputCls} placeholder="Merupakan suatu kehormatan dan kebahagiaan apabila Bapak/Ibu berkenan hadir..." />
                </Field>
              </>
            )}

            {/* ===== ACARA ===== */}
            {tab === "acara" && (
              <>
                {form.events.map((ev, i) => (
                  <div key={i} className="rounded-2xl border border-stone-200 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <input
                        value={ev.name}
                        onChange={(e) => updateEvent(i, { name: e.target.value })}
                        className="border-b border-transparent bg-transparent font-semibold text-stone-800 outline-none transition hover:border-stone-300 focus:border-brand-500"
                        placeholder="Nama acara"
                      />
                      {form.events.length > 1 && (
                        <button onClick={() => set("events", form.events.filter((_, j) => j !== i))} className="text-sm text-red-500 hover:text-red-600">
                          Hapus
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Tanggal">
                        <input type="date" value={ev.date} onChange={(e) => updateEvent(i, { date: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Mulai">
                        <input type="time" value={ev.startTime} onChange={(e) => updateEvent(i, { startTime: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Selesai">
                        <input type="time" value={ev.endTime} onChange={(e) => updateEvent(i, { endTime: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Nama tempat / gedung">
                        <input value={ev.place} onChange={(e) => updateEvent(i, { place: e.target.value })} className={inputCls} placeholder="cth: Pendopo Agung Tirta Amerta" />
                      </Field>
                      <Field label="Link Google Maps" hint="Buka Google Maps → Bagikan → Salin link.">
                        <input value={ev.mapsUrl} onChange={(e) => updateEvent(i, { mapsUrl: e.target.value })} className={inputCls} placeholder="https://maps.app.goo.gl/..." />
                      </Field>
                    </div>
                    <div className="mt-4">
                      <Field label="Alamat lengkap">
                        <textarea rows={2} value={ev.address} onChange={(e) => updateEvent(i, { address: e.target.value })} className={inputCls} placeholder="Jl. Contoh No. 123, Kota" />
                      </Field>
                    </div>
                    <div className="mt-4">
                      <Field
                        label="Peta manual (opsional)"
                        hint="Tempel kode sematkan dari Google Maps → Bagikan → Sematkan peta (boleh kode <iframe> utuh), URL embed, atau koordinat cth: -6.200, 106.816. Kosongkan untuk memakai pencarian otomatis."
                      >
                        <textarea rows={3} value={ev.mapsEmbed} onChange={(e) => updateEvent(i, { mapsEmbed: e.target.value })} className={`${inputCls} font-mono text-xs`} placeholder={'<iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'} />
                      </Field>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    set("events", [...form.events, { name: "Acara Baru", date: "", startTime: "09:00", endTime: "11:00", place: "", address: "", mapsUrl: "", mapsEmbed: "" }])
                  }
                  className="w-full rounded-2xl border-2 border-dashed border-stone-300 py-3.5 text-sm font-medium text-stone-500 transition hover:border-brand-400 hover:text-brand-600"
                >
                  + Tambah sesi acara
                </button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Dresscode" hint="Opsional — cth: Batik, White & Gold, Bebas rapi.">
                    <input value={form.dressCode} onChange={(e) => set("dressCode", e.target.value)} className={inputCls} placeholder="cth: Batik" />
                  </Field>
                  <Field label="Link live streaming" hint="Opsional — misal YouTube/Twitch untuk tamu yang berhalangan.">
                    <input value={form.streamingUrl} onChange={(e) => set("streamingUrl", e.target.value)} className={inputCls} placeholder="https://youtube.com/live/..." />
                  </Field>
                </div>
              </>
            )}

            {/* ===== CERITA ===== */}
            {tab === "cerita" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Isi kutipan" hint="Ayat, doa, atau kutipan favorit kalian.">
                    <textarea rows={3} value={form.quoteText} onChange={(e) => set("quoteText", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Sumber kutipan">
                    <input value={form.quoteSource} onChange={(e) => set("quoteSource", e.target.value)} className={inputCls} placeholder="cth: QS. Ar-Rum: 21" />
                  </Field>
                </div>

                <h3 className="pt-2 font-semibold text-stone-800">Garis waktu cerita</h3>
                {form.story.map((s, i) => (
                  <div key={i} className="grid gap-4 rounded-2xl border border-stone-200 p-5 sm:grid-cols-[140px_1fr]">
                    <div className="space-y-4">
                      <Field label="Tanggal"><input type="date" value={s.date} onChange={(e) => set("story", form.story.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} className={inputCls} /></Field>
                      <Field label="Judul"><input value={s.title} onChange={(e) => set("story", form.story.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className={inputCls} placeholder="Awal Bertemu" /></Field>
                      <button onClick={() => set("story", form.story.filter((_, j) => j !== i))} className="text-xs font-medium text-red-500 hover:text-red-600">Hapus momen</button>
                    </div>
                    <Field label="Ceritakan momennya">
                      <textarea rows={4} value={s.text} onChange={(e) => set("story", form.story.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} className={inputCls} />
                    </Field>
                  </div>
                ))}
                <button
                  onClick={() => set("story", [...form.story, { date: "", title: "", text: "" }])}
                  className="w-full rounded-2xl border-2 border-dashed border-stone-300 py-3.5 text-sm font-medium text-stone-500 transition hover:border-brand-400 hover:text-brand-600"
                >
                  + Tambah momen cerita
                </button>
              </>
            )}

            {/* ===== GALERI ===== */}
            {tab === "galeri" && (
              <>
                <UploadZone
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  icon="📷"
                  label="Klik untuk unggah foto"
                  hint="JPG/PNG/WebP/GIF · maks 8 MB per foto · bisa pilih banyak sekaligus"
                  onUploaded={(urls) => set("galleryUrls", [...form.galleryUrls, ...urls])}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">atau tempel URL foto eksternal</label>
                  <div className="flex gap-2">
                    <input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://contoh.com/foto.jpg"
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          set("galleryUrls", [...form.galleryUrls, newImageUrl.trim()]);
                          setNewImageUrl("");
                        }
                      }}
                      className="shrink-0 rounded-xl bg-stone-800 px-5 text-sm font-semibold text-white transition hover:bg-stone-700"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
                {form.galleryUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {form.galleryUrls.map((url, i) => (
                      <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.15")} />
                        <button
                          onClick={() => {
                            discardUpload(url);
                            set("galleryUrls", form.galleryUrls.filter((_, j) => j !== i));
                          }}
                          className="absolute right-1.5 top-1.5 hidden h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
                          aria-label="Hapus foto"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-stone-100 pt-2">
                  <h3 className="mb-3 font-semibold text-stone-800">🎬 Video momen</h3>
                  <UploadZone
                    accept="video/mp4,video/webm,video/quicktime"
                    multiple
                    icon="🎥"
                    label="Klik untuk unggah video"
                    hint="MP4/WebM/MOV · maks 64 MB per video"
                    onUploaded={(urls) => set("galleryVideos", [...form.galleryVideos, ...urls])}
                  />
                  {form.galleryVideos.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {form.galleryVideos.map((url, i) => (
                        <div key={`${url}-${i}`} className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-black">
                          <video src={url} controls preload="metadata" className="max-h-72 w-full" />
                          <button
                            onClick={() => {
                              discardUpload(url);
                              set("galleryVideos", form.galleryVideos.filter((_, j) => j !== i));
                            }}
                            className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white opacity-90 transition hover:bg-red-600"
                          >
                            Hapus video
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-2">
                  <h3 className="mb-3 font-semibold text-stone-800">🎵 Musik latar</h3>
                  <UploadZone
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac"
                    icon="🎶"
                    label={form.musicUrl ? "Ganti musik latar" : "Klik untuk unggah musik"}
                    hint="MP3/WAV/OGG/M4A · maks 16 MB · diputar saat undangan dibuka"
                    onUploaded={([url]) => set("musicUrl", url)}
                  />
                  {form.musicUrl.startsWith("/api/media/") && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-brand-50/60 px-4 py-3 ring-1 ring-brand-100">
                      <span className="text-lg">🎧</span>
                      <audio src={form.musicUrl} controls preload="metadata" className="h-9 w-full max-w-xs" />
                      <button
                        onClick={() => {
                          discardUpload(form.musicUrl);
                          set("musicUrl", "");
                        }}
                        className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                  <Field label="atau tempel URL mp3 eksternal" hint="Masukkan link file audio yang bisa diakses publik.">
                    <input value={form.musicUrl} onChange={(e) => set("musicUrl", e.target.value)} className={inputCls} placeholder="https://contoh.com/lagu.mp3" />
                  </Field>
                </div>
                {!PLANS[initial.plan in PLANS ? (initial.plan as keyof typeof PLANS) : "FREE"].features.find((f) => f.label === "Musik latar")!.included && (
                  <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                    ⚠️ Musik latar adalah fitur paket Basic ke atas. Isi dulu boleh, tapi baru berbunyi setelah upgrade.
                  </p>
                )}
              </>
            )}

            {/* ===== AMPLOP ===== */}
            {tab === "amplop" && (
              <>
                <p className="rounded-xl bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-500">
                  Tamu dapat menyalin nomor rekening dengan satu klik, atau mengirim hadiah fisik ke alamat yang dicantumkan.
                </p>
                <datalist id="bank-suggestions">
                  {BANK_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                {form.banks.map((b, i) => (
                  <div key={i} className="grid gap-4 rounded-2xl border border-stone-200 p-5 sm:grid-cols-3">
                    <Field label="Bank / E-wallet" hint="Kartu otomatis tampil dengan warna brand bank/e-wallet.">
                      <input value={b.bank} onChange={(e) => updateBank(i, { bank: e.target.value })} className={inputCls} list="bank-suggestions" placeholder="BCA / DANA / GoPay" /></Field>
                    <Field label="Nomor rekening"><input value={b.number} onChange={(e) => updateBank(i, { number: e.target.value })} className={inputCls} placeholder="1234567890" /></Field>
                    <Field label="Atas nama"><input value={b.holder} onChange={(e) => updateBank(i, { holder: e.target.value })} className={inputCls} placeholder="Hendra Kusuma" /></Field>
                    {form.banks.length > 1 && (
                      <button onClick={() => set("banks", form.banks.filter((_, j) => j !== i))} className="justify-self-start text-xs font-medium text-red-500 hover:text-red-600 sm:col-span-3">
                        Hapus rekening ini
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => set("banks", [...form.banks, { bank: "", number: "", holder: "" }])}
                  className="w-full rounded-2xl border-2 border-dashed border-stone-300 py-3.5 text-sm font-medium text-stone-500 transition hover:border-brand-400 hover:text-brand-600"
                >
                  + Tambah rekening / e-wallet
                </button>
                <Field label="Alamat kirim hadiah fisik" hint="Opsional — untuk tamu yang ingin mengirim kado langsung.">
                  <textarea rows={3} value={form.giftAddress} onChange={(e) => set("giftAddress", e.target.value)} className={inputCls} />
                </Field>
              </>
            )}

            {/* ===== TEMA & LINK ===== */}
            {tab === "tema" && (
              <>
                <div>
                  <h3 className="font-semibold text-stone-800">Katalog tema</h3>
                  <p className="mt-0.5 text-xs text-stone-400">Ganti tema akan mereset ornamen &amp; warna kustom ke bawaan tema baru.</p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {THEMES.map((t) => {
                      const compatible = t.categories.includes(initial.category);
                      const active = themeId === t.id;
                      return (
                        <div key={t.id} className={active ? "" : compatible ? "" : "pointer-events-auto opacity-45"}>
                          <ThemePreviewCard
                            id={t.id}
                            selected={active}
                            onSelect={() => { if (compatible) chooseTheme(t.id); }}
                            overrideArt={active ? resolveArt() : undefined}
                            overridePalette={active && palEnabled ? palColors : undefined}
                          />
                          {!compatible && (
                            <p className="mt-1 text-center text-[10px] text-stone-400">bukan untuk kategori ini</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-5 rounded-2xl border border-stone-200 p-6">
                  <div>
                    <h3 className="font-semibold text-stone-800">Ornamen tambahan</h3>
                    <p className="mt-0.5 text-xs text-stone-400">Kombinasi bebas — pratinjau kartu tema di atas ikut berubah.</p>
                  </div>
                  <OrnamentSlotPicker
                    label="Ornamen sudut cover"
                    value={artSlots.corners}
                    options={["floral-corner", "corner-expanded"]}
                    onChange={(v) => setArtSlots((s) => ({ ...s, corners: v }))}
                  />
                  <OrnamentSlotPicker
                    label="Hiasan latar penuh"
                    value={artSlots.backdrop}
                    options={["balloon-border", "gunung-silhouette"]}
                    onChange={(v) => setArtSlots((s) => ({ ...s, backdrop: v }))}
                  />
                  <OrnamentSlotPicker
                    label="Bingkai di belakang mempelai"
                    value={artSlots.frame}
                    options={["calligraphy-frame"]}
                    onChange={(v) => setArtSlots((s) => ({ ...s, frame: v }))}
                  />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-600">Transparansi awan bawah</span>
                      <button
                        type="button"
                        onClick={() => setCloudsOpacity(null)}
                        className={`text-[10px] font-semibold uppercase tracking-wide ${cloudsOpacity === null ? "text-brand-600" : "text-stone-400 hover:text-stone-600"}`}
                      >
                        {cloudsOpacity === null ? "Ikut tema" : "Reset"}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={cloudsOpacity ?? 100}
                        onChange={(e) => setCloudsOpacity(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-200 accent-brand-600"
                      />
                      <span className="w-12 text-right text-xs tabular-nums text-stone-500">{cloudsOpacity ?? 100}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 p-6">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={palEnabled}
                      onChange={(e) => setPalEnabled(e.target.checked)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span>
                      <span className="block font-semibold text-stone-800">Palet warna kustom</span>
                      <span className="block text-xs text-stone-400">Nonaktif = mengikuti warna bawaan tema.</span>
                    </span>
                  </label>

                  {palEnabled && (
                    <>
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Preset cepat</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {PALETTE_PRESETS.map((pr) => (
                            <button
                              key={pr.name}
                              type="button"
                              onClick={() => setPalColors((c) => ({ ...c, accent: pr.accent, accent2: pr.accent2 }))}
                              className="flex items-center gap-2 rounded-full border border-stone-200 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-stone-700 transition hover:border-brand-400 hover:text-brand-700"
                            >
                              <span className="flex gap-0.5">
                                <span className="h-4 w-4 rounded-full" style={{ background: pr.accent }} />
                                <span className="h-4 w-4 rounded-full" style={{ background: pr.accent2 }} />
                              </span>
                              {pr.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {PALETTE_FIELDS.map(([key, label]) => (
                          <Field key={key} label={label}>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={palColors[key]}
                                onChange={(e) => setPalColors((c) => ({ ...c, [key]: e.target.value }))}
                                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                              />
                              <input
                                value={palColors[key]}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (/^#[0-9a-fA-F]{0,8}$/.test(v)) setPalColors((c) => ({ ...c, [key]: v }));
                                }}
                                className={`${inputCls} font-mono text-xs uppercase`}
                              />
                            </div>
                          </Field>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-stone-400">
                        Pratinjau kartu tema aktif di atas sudah memakai warna ini. Hasil akhir terlihat di halaman undangan setelah disimpan.
                      </p>
                    </>
                  )}
                </div>

                <Field label="Ubah link undangan">
                  <div className="flex items-center overflow-hidden rounded-xl border border-stone-300 focus-within:border-brand-500">
                    <span className="border-r border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-400">kondanganyuk.com/</span>
                    <input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        checkSlug(e.target.value);
                      }}
                      className="flex-1 px-3 py-2.5 text-sm outline-none"
                    />
                  </div>
                  {slugStatus && <p className={`mt-1.5 text-xs ${slugStatus.ok ? "text-green-600" : "text-red-500"}`}>{slugStatus.msg}</p>}
                </Field>

                <div className="rounded-2xl border border-stone-200 p-5">
                  <p className="text-sm font-semibold text-stone-800">Gambar pratinjau WhatsApp / OG</p>
                  <p className="mt-1 text-xs text-stone-400">
                    Gambar yang tampil saat link dibagikan ke WhatsApp/Sosmed. Ideal 1200×630 px (rasio 1,91:1). Kosong = dibuat otomatis dari tema &amp; nama undangan.
                  </p>
                  {ogImage ? (
                    <div className="mt-4 flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ogImage} alt="Pratinjau gambar OG" className="h-28 w-[10.75rem] rounded-xl border border-stone-200 object-cover" />
                      <button type="button" onClick={() => setOgImage(null)} className="text-sm font-semibold text-red-500 hover:text-red-600">
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <UploadZone
                        accept="image/*"
                        icon="🖼️"
                        label="Unggah gambar pratinjau"
                        hint="JPG/PNG/WebP, disarankan ≤ 4 MB."
                        onUploaded={(urls) => setOgImage(urls[0] ?? null)}
                      />
                    </div>
                  )}
                  <p className="mt-3 text-xs text-stone-400">Jangan lupa klik Simpan setelah mengunggah/menghapus.</p>
                </div>
              </>
            )}

            {tab === "huruf" && (
              <div className="space-y-4">
                <p className="text-sm text-stone-500">
                  Atur gaya font judul, ukuran teks, dan warna teks untuk setiap bagian undangan. Bagian tanpa pengaturan mengikuti tema.
                </p>
                {SECTION_KEYS.map((k) => {
                  const cfg: SectionStyle = secStyles[k] ?? {};
                  const dirty = Boolean(cfg.headingFont || cfg.scale || cfg.textColor);
                  function patch(p: Partial<SectionStyle>) {
                    setSecStyles((s) => ({ ...s, [k]: { ...s[k], ...p } }));
                  }
                  function resetSec() {
                    setSecStyles((s) => {
                      const next = { ...s };
                      delete next[k];
                      return next;
                    });
                  }
                  return (
                    <div key={k} className="rounded-2xl border border-stone-200 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-stone-800">
                          {SECTION_LABELS[k]}
                          {!dirty && <span className="ml-2 text-xs font-normal text-stone-400">(ikut tema)</span>}
                        </p>
                        {dirty && (
                          <button type="button" onClick={resetSec} className="text-xs font-semibold text-stone-400 hover:text-red-500">
                            Reset seksi
                          </button>
                        )}
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                        <Field label="Gaya font judul">
                          <select
                            value={cfg.headingFont ?? ""}
                            onChange={(e) => patch({ headingFont: e.target.value || undefined })}
                            className={inputCls}
                          >
                            {HEADING_FONT_OPTIONS.map((f) => (
                              <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Ukuran">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={85}
                              max={125}
                              step={5}
                              value={(cfg.scale ?? 1) * 100}
                              onChange={(e) => {
                                const v = Number(e.target.value) / 100;
                                patch({ scale: v === 1 ? undefined : v });
                              }}
                              className="w-28 accent-brand-600"
                            />
                            <span className="w-10 text-right text-xs tabular-nums text-stone-500">{Math.round((cfg.scale ?? 1) * 100)}%</span>
                          </div>
                        </Field>
                        <Field label="Warna teks">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={cfg.textColor ?? "#000000"}
                              onChange={(e) => patch({ textColor: e.target.value })}
                              className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
                            />
                            <button
                              type="button"
                              onClick={() => patch({ textColor: undefined })}
                              disabled={!cfg.textColor}
                              className="rounded-lg border border-stone-200 px-2.5 py-2 text-xs font-semibold text-stone-500 transition enabled:hover:border-stone-300 disabled:opacity-40"
                            >
                              Reset
                            </button>
                          </div>
                        </Field>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "tamu" && <GuestsPanel invitationId={initial.id} slug={slug} initialTemplate={initial.waTemplate} />}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-800">Status</h3>
            <p className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.cls}`}>{statusInfo.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{statusInfo.desc}</p>

            {(initial.status === "DRAFT" || initial.status === "EXPIRED") && (
              <button
                onClick={() => setPayOpen(true)}
                className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700"
              >
                Aktifkan Undangan
              </button>
            )}
            {initial.status === "PENDING" && initial.lastOrderId && (
              <Link href={`/pesanan/${initial.lastOrderId}`} className="mt-4 block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-bold text-white transition hover:bg-amber-600">
                Lanjutkan Pembayaran
              </Link>
            )}
            {initial.status === "ACTIVE" && (
              <a href={previewHref} target="_blank" rel="noreferrer" className="mt-4 block w-full rounded-xl border-2 border-stone-800 py-3 text-center text-sm font-bold text-stone-800 transition hover:bg-stone-800 hover:text-white">
                Lihat Undangan ↗
              </a>
            )}
          </div>

          {/* Panel pembayaran */}
          {payOpen && <PaymentPanel invitationId={initial.id} onClose={() => setPayOpen(false)} />}

          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-800">Kelola</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link href={`/dashboard/undangan/${initial.id}/tamu`} className="flex items-center justify-between rounded-xl px-4 py-2.5 transition hover:bg-stone-50">
                <span>👥 Daftar tamu</span><span className="text-stone-400">{initial.guestCount}</span>
              </Link>
              <Link href={`/dashboard/undangan/${initial.id}/ucapan`} className="flex items-center justify-between rounded-xl px-4 py-2.5 transition hover:bg-stone-50">
                <span>🙏 Ucapan &amp; RSVP</span><span className="text-stone-400">{initial.wishCount}</span>
              </Link>
              <Link href={`/dashboard/undangan/${initial.id}/checkin`} className="flex items-center justify-between rounded-xl px-4 py-2.5 transition hover:bg-stone-50">
                <span>📱 QR Check-in</span><span className="text-stone-400">→</span>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-800">Bagikan cepat</h3>
            <ShareBox slug={initial.slug} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ShareBox({ slug }: { slug: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* abaikan */ }
  }

  return (
    <div className="mt-3 space-y-3">
      <div>
        <p className="text-xs font-medium text-stone-400">Link umum</p>
        <button onClick={() => copy(`${typeof window !== "undefined" ? window.location.origin : ""}/${slug}`, "umum")} className="mt-1 w-full truncate rounded-xl bg-stone-50 px-3 py-2 text-left text-xs text-stone-600 ring-1 ring-stone-200 transition hover:bg-stone-100">
          /{slug} {copied === "umum" && "· tersalin!"}
        </button>
      </div>
      <div>
        <p className="text-xs font-medium text-stone-400">Contoh link personal tamu</p>
        <button onClick={() => copy(`/${slug}?to=Bapak+Budi`, "personal")} className="mt-1 w-full truncate rounded-xl bg-stone-50 px-3 py-2 text-left text-xs text-stone-600 ring-1 ring-stone-200 transition hover:bg-stone-100">
          /{slug}?to=Bapak+Budi {copied === "personal" && "· tersalin!"}
        </button>
        <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">
          Tambahkan nama tamu lewat menu Daftar Tamu agar link personal dibuat otomatis.
        </p>
      </div>
    </div>
  );
}

function PaymentPanel({ invitationId, onClose }: { invitationId: string; onClose: () => void }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"BASIC" | "PREMIUM">("PREMIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startPayment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, plan, method: "QRIS" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat pesanan");
      router.push(`/pesanan/${json.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-900">Aktifkan Undangan</h3>
          <button onClick={onClose} className="rounded-full p-2 text-stone-400 hover:bg-stone-100">✕</button>
        </div>
        <p className="mt-1 text-sm text-stone-500">Sekali bayar — tanpa biaya bulanan.</p>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 space-y-3">
          {(["BASIC", "PREMIUM"] as const).map((id) => {
            const p = PLANS[id];
            return (
              <button
                key={id}
                onClick={() => setPlan(id)}
                className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                  plan === id ? "border-brand-500 bg-brand-50/50 ring-4 ring-brand-100" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">{p.name}</span>
                  <span className="font-bold text-brand-600">{formatRupiah(p.price)}</span>
                </div>
                <p className="mt-0.5 text-xs text-stone-500">{p.durationDays ? `Aktif ${p.durationDays} hari` : "Aktif selamanya"} · tanpa watermark · amplop digital{p.id === "PREMIUM" ? " · QR check-in" : ""}</p>
              </button>
            );
          })}
        </div>
        <button
          onClick={startPayment}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Memproses..." : `Bayar ${formatRupiah(PLANS[plan].price)}`}
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-stone-400">
          Pembayaran aman via QRIS, VA bank, gerai retail &amp; e-wallet.
        </p>
      </div>
    </div>
  );
}
