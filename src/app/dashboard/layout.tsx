import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/masuk?lanjut=/dashboard");

  return (
    <div className="min-h-screen bg-stone-100">
      <DashboardNav user={user} />
      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:ml-64 lg:px-8 lg:py-10 xl:px-12">
        <div className="mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}

export function DashboardFooterLink() {
  return (
    <Link href="/" className="text-xs text-stone-400 hover:text-brand-600">
      ← Kembali ke halaman utama
    </Link>
  );
}
