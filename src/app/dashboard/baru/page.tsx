"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemePreviewCard } from "@/components/marketing/theme-preview-card";
import { THEMES } from "@/lib/themes";
import { CATEGORY_LABELS } from "@/lib/invitation-data";
import { slugify } from "@/lib/utils";

const CATEGORIES = ["WEDDING", "KHITAN", "AQIQAH", "BIRTHDAY", "EVENT"] as const;

export default function BuatUndanganPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string>("WEDDING");
  const [themeId, setThemeId] = useState<string>("amara");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<null | { available: boolean; reason?: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const themesForCategory = THEMES.filter((t) => t.categories.includes(category));

  async function checkSlug(value: string) {
    const s = slugify(value);
    if (!s) return setSlugStatus(null);
    const res = await fetch(`/api/invitations/check-slug?slug=${encodeURIComponent(s)}`);
    setSlugStatus(await res.json());
  }

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, themeId, title: title || "Undangan Saya", slug: slug || title }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal membuat undangan");
      router.push(`/dashboard/undangan/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">Buat Undangan Baru</h1>
      <p className="mt-1 text-sm text-stone-500">3 langkah cepat — semua bisa diubah lagi nanti.</p>

      {/* Indikator langkah */}
      <ol className="mt-8 flex items-center gap-3">
        {["Kategori", "Tema", "Detail"].map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(i + 1)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                step === i + 1
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : step > i + 1
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-100 text-stone-400"
              }`}
            >
              <span>{step > i + 1 ? "✓" : i + 1}</span> {label}
            </button>
            {i < 2 && <span className="hidden h-px w-8 bg-stone-300 sm:block" />}
          </li>
        ))}
      </ol>

      {/* Langkah 1: kategori */}
      {step === 1 && (
        <section className="anim-fade-in mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => {
              const count = THEMES.filter((t) => t.categories.includes(c)).length;
              const emoji = { WEDDING: "💍", KHITAN: "🕌", AQIQAH: "🍼", BIRTHDAY: "🎂", EVENT: "🎪" }[c];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c);
                    const first = THEMES.find((t) => t.categories.includes(c));
                    if (first && !THEMES.find((t) => t.id === themeId)?.categories.includes(c)) {
                      setThemeId(first.id);
                    }
                  }}
                  className={`rounded-2xl border-2 p-6 text-left transition ${
                    category === c
                      ? "border-brand-500 bg-brand-50/60 ring-4 ring-brand-100"
                      : "border-stone-200 bg-white hover:border-stone-300 hover:shadow"
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <p className="mt-3 font-semibold text-stone-800">{CATEGORY_LABELS[c]}</p>
                  <p className="text-xs text-stone-400">{count} tema tersedia</p>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={() => setStep(2)} className="rounded-full bg-stone-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700">
              Lanjut →
            </button>
          </div>
        </section>
      )}

      {/* Langkah 2: tema */}
      {step === 2 && (
        <section className="anim-fade-in mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {themesForCategory.map((t) => (
              <ThemePreviewCard key={t.id} id={t.id} selected={themeId === t.id} onSelect={() => setThemeId(t.id)} />
            ))}
          </div>
          {themesForCategory.length === 0 && (
            <p className="text-sm text-stone-500">Belum ada tema khusus untuk kategori ini — tema lain tetap bisa dipakai.</p>
          )}
          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">
              ← Kembali
            </button>
            <button onClick={() => setStep(3)} className="rounded-full bg-stone-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700">
              Lanjut →
            </button>
          </div>
        </section>
      )}

      {/* Langkah 3: detail */}
      {step === 3 && (
        <section className="anim-fade-in mt-8 max-w-xl">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-stone-700">
              Nama undangan (internal)
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) checkSlug(e.target.value);
              }}
              placeholder="cth: Undangan Dinda & Hendra"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1.5 mb-5 text-xs text-stone-400">
              Hanya untuk membedakan daftar undangan Anda, tidak tampil di undangan.
            </p>

            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-stone-700">
              Link undangan
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-stone-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <span className="border-r border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-400">
                kondanganyuk.com/
              </span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  checkSlug(e.target.value);
                }}
                placeholder="dinda-hendra"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
              />
            </div>
            {slugStatus && slug && (
              <p className={`mt-1.5 text-xs ${slugStatus.available ? "text-green-600" : "text-red-500"}`}>
                {slugStatus.available ? `✓ /${slugify(slug)} tersedia` : `✕ ${slugStatus.reason ?? "Link sudah dipakai"}`}
              </p>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50">
                ← Kembali
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-full bg-brand-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "Membuat..." : "Buat Undangan ✨"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
