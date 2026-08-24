import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-chrome";
import { ThemePreviewCard } from "@/components/marketing/theme-preview-card";
import { THEMES } from "@/lib/themes";

export const metadata: Metadata = {
  title: "Katalog Tema",
  description: "Jelajahi semua tema undangan digital Kondanganyuk untuk pernikahan, khitanan, aqiqah, dan acara lainnya.",
};

const CATEGORY_TABS = [
  { id: "ALL", label: "Semua" },
  { id: "WEDDING", label: "Pernikahan" },
  { id: "KHITAN", label: "Khitanan" },
  { id: "AQIQAH", label: "Aqiqah" },
  { id: "BIRTHDAY", label: "Ulang Tahun" },
  { id: "EVENT", label: "Event" },
];

export default async function TemaPage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen">
      <SiteHeader authed={!!user} />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900">Katalog Tema</h1>
          <p className="mx-auto mt-4 max-w-xl text-stone-600">
            Semua tema dibuat original dan bisa diubah warna serta isinya sesuai acara Anda.
          </p>
        </div>

        {CATEGORY_TABS.map((cat) => {
          if (cat.id !== "ALL") return null;
          return (
            <section key={cat.id} className="mt-14">
              <h2 className="mb-6 text-lg font-semibold text-stone-800">Semua tema ({THEMES.length})</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {THEMES.map((t) => (
                  <ThemePreviewCard key={t.id} id={t.id} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Daftar per kategori untuk SEO & kejelasan */}
        {CATEGORY_TABS.slice(1).map((cat) => {
          const list = THEMES.filter((t) => t.categories.includes(cat.id));
          if (list.length === 0) return null;
          return (
            <section key={cat.id} className="mt-16 border-t border-stone-100 pt-12">
              <h2 className="mb-6 text-lg font-semibold text-stone-800">
                Tema {cat.label} <span className="text-stone-400">({list.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:hidden">
                {list.map((t) => (
                  <div key={t.id} id={t.id}>
                    <ThemePreviewCard id={t.id} />
                  </div>
                ))}
              </div>
              <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                {list.map((t) => (
                  <div key={t.id} id={t.id}>
                    <ThemePreviewCard id={t.id} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
