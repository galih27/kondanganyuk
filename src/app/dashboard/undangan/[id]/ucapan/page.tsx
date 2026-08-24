import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { WishesManager } from "@/components/dashboard/wishes-manager";

export const dynamic = "force-dynamic";

export default async function UcapanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;

  const invitation = await db.invitation.findFirst({
    where: { id, userId: user.id },
    select: { title: true },
  });
  if (!invitation) notFound();

  const wishes = await db.wish.findMany({
    where: { invitationId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <WishesManager
      invitationId={id}
      title={invitation.title}
      initialWishes={wishes.map((w) => ({
        id: w.id,
        guestName: w.guestName,
        attendance: w.attendance,
        message: w.message,
        reply: w.reply,
        createdAt: w.createdAt.toISOString(),
      }))}
    />
  );
}
