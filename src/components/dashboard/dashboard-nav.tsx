"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EDITOR_TABS, normalizeTab } from "@/lib/editor-tabs";

type NavUser = { id: string; name: string; email: string; role: string };

const LINKS = [
  { href: "/dashboard", label: "Undangan Saya", icon: "💌" },
  { href: "/dashboard/baru", label: "Buat Undangan", icon: "✨" },
];

export function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Di dalam editor undangan: menu utama digantikan tab bagian editor.
  const isEditor = /^\/dashboard\/undangan\/[^/]+$/.test(pathname);
  const activeTab = normalizeTab(params.get("tab"));

  function setTab(id: string) {
    const p = new URLSearchParams(params.toString());
    p.set("tab", id);
    router.replace(`${pathname}?${p}`, { scroll: false });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  // Tombol kembali kontekstual: dari editor → daftar undangan, selain itu riwayat sebelumnya.
  const showBack = pathname !== "/dashboard";
  function goBack() {
    if (isEditor) router.push("/dashboard");
    else router.back();
  }

  const nav = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg text-white">♥</span>
        <span className="text-lg font-semibold tracking-tight">
          Kondangan<span className="text-brand-600">yuk</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {isEditor ? (
          <>
            <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Bagian Undangan
            </p>
            {EDITOR_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={activeTab === t.id ? "true" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === t.id
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
            <Link
              href="/dashboard"
              className={`mt-3 flex items-center gap-3 rounded-xl border border-dashed border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-500 transition hover:bg-stone-50`}
            >
              ← Semua undangan
            </Link>
          </>
        ) : (
          <>
            {LINKS.map((l) => {
              const active = l.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active ? "bg-brand-600 text-white shadow-md shadow-brand-200" : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span>{l.icon}</span> {l.label}
                </Link>
              );
            })}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  pathname.startsWith("/admin") ? "bg-stone-800 text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span>🛠️</span> Panel Admin
              </Link>
            )}
          </>
        )}
      </nav>
      <div className="border-t border-stone-200 p-4">
        <div className="mb-3 px-1">
          <p className="truncate text-sm font-semibold text-stone-800">{user.name}</p>
          <p className="truncate text-xs text-stone-400">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
        >
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Topbar mobile — toggle di kiri, disusul tombol kembali */}
      <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-stone-200 bg-white px-3 py-2.5 lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="shrink-0 rounded-xl p-2.5 text-lg leading-none text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-100"
        >
          {open ? "✕" : "☰"}
        </button>
        {showBack && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100 active:scale-[0.98]"
          >
            <span aria-hidden>←</span>
            {isEditor ? "Daftar Undangan" : "Kembali"}
          </button>
        )}
        <Link href="/dashboard" className="ml-auto flex items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">♥</span>
          <span className="text-sm font-semibold">Kondanganyuk</span>
        </Link>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-72 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {nav}
          </aside>
        </div>
      )}
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-stone-200 bg-white lg:block">
        {nav}
      </aside>
    </>
  );
}
