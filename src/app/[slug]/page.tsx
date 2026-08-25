import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { normalizeInvitationData } from "@/lib/invitation-data";
import { getTheme, type ThemeArt, type ThemePalette } from "@/lib/themes";
import { isFeatureUnlocked } from "@/lib/plans";
import { InvitationView } from "@/components/themes/invitation-view";

export const dynamic = "force-dynamic";

async function getInvitation(slug: string) {
  return db.invitation.findUnique({
    where: { slug },
    include: {
      wishes: { orderBy: { createdAt: "desc" }, take: 60 },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation || invitation.status !== "ACTIVE") {
    return { title: "Undangan tidak tersedia" };
  }
  const data = normalizeInvitationData(JSON.parse(invitation.data || "{}"));
  const title =
    invitation.category === "WEDDING"
      ? [data.groomName, data.brideName].filter(Boolean).join(" & ") || invitation.title
      : data.personName || invitation.title;
  return {
    title: `Undangan ${title}`,
    description: `Undangan digital untuk ${title}. Kami menantikan kehadiran Anda.`,
    openGraph: {
      title: `Undangan ${title}`,
      description: "Buka undangan ini untuk melihat detail acara.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Undangan ${title}`,
      description: "Buka undangan ini untuk melihat detail acara.",
    },
  };
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  // Undangan belum aktif → halaman pemberitahuan
  if (invitation.status !== "ACTIVE") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-4 text-center">
        <span className="text-6xl">✉️</span>
        <h1 className="mt-5 text-2xl font-bold text-stone-800">Undangan sedang disiapkan</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500">
          Undangan ini belum diaktifkan oleh pemiliknya. Silakan kembali lagi nanti.
        </p>
        <Link href="/" className="mt-8 rounded-full bg-stone-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700">
          Buat undanganmu sendiri di Kondanganyuk
        </Link>
      </main>
    );
  }

  // Hitung kunjungan (fire-and-forget)
  db.invitation.update({ where: { id: invitation.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const data = normalizeInvitationData(JSON.parse(invitation.data || "{}"));
  const theme = getTheme(invitation.themeId);

  // Override tema kustom (aturan editor: ornamen & palet)
  let artOverride: ThemeArt | null = null;
  let paletteOverride: Partial<ThemePalette> | null = null;
  try {
    if (invitation.themeArt) artOverride = JSON.parse(invitation.themeArt);
    if (invitation.themePalette) paletteOverride = JSON.parse(invitation.themePalette);
  } catch {
    /* abaikan JSON rusak */
  }

  // Nama tamu dari ?to=Nama
  const rawTo = sp.to;
  const guestName = (Array.isArray(rawTo) ? rawTo[0] : rawTo) ?? "";

  return (
    <InvitationView
      slug={invitation.slug}
      category={invitation.category}
      plan={invitation.plan}
      themeId={theme.id}
      data={data}
      guestName={guestName}
      artOverride={artOverride}
      paletteOverride={paletteOverride}
      initialWishes={invitation.wishes.map((w) => ({
        id: w.id,
        guestName: w.guestName,
        attendance: w.attendance,
        message: w.message,
        reply: w.reply,
      }))}
      unlocked={{
        music: isFeatureUnlocked(invitation.plan, "music"),
        gift: isFeatureUnlocked(invitation.plan, "gift"),
        watermark: isFeatureUnlocked(invitation.plan, "watermark"),
      }}
    />
  );
}
