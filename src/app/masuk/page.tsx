"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MasukForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal masuk");
      router.push(params.get("lanjut") || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}

export default function MasukPage() {
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
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Selamat datang kembali</h1>
          <p className="mt-1.5 mb-6 text-sm text-stone-500">Masuk untuk mengelola undangan Anda.</p>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-stone-100" />}>
            <MasukForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-stone-500">
            Belum punya akun?{" "}
            <Link href="/daftar" className="font-semibold text-brand-600 hover:text-brand-700">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
