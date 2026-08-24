import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk?lanjut=/admin");
  // Guard ganda di server component
  const dbUser = user.role === "ADMIN" ? user : null;
  if (!dbUser) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-900/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">🛠️</span>
              Panel Admin
            </Link>
            <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-[11px] font-medium text-stone-400">Kondanganyuk</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard" className="text-stone-400 transition hover:text-white">← Dashboard saya</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
