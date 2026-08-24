"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mendaftar");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg text-white shadow-sm">♥</span>
          <span className="text-xl font-semibold tracking-tight">
            Kondangan<span className="text-brand-600">yuk</span>
          </span>
        </Link>
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl shadow-stone-200/50">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Buat akun gratis</h1>
          <p className="mt-1.5 mb-6 text-sm text-stone-500">
            Coba buat undangan tanpa biaya — bayar hanya saat siap aktif.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">Nama lengkap</label>
              <input id="name" required minLength={2} value={form.name} onChange={update("name")}
                placeholder="Nama Anda"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
              <input id="email" type="email" required value={form.email} onChange={update("email")}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-stone-700">
                No. WhatsApp <span className="font-normal text-stone-400">(opsional)</span>
              </label>
              <input id="phone" value={form.phone} onChange={update("phone")}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
              <input id="password" type="password" required minLength={6} value={form.password} onChange={update("password")}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-500">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="font-semibold text-brand-600 hover:text-brand-700">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
