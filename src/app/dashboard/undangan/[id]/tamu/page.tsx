import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { GuestManager } from "@/components/dashboard/guest-manager";
import { findAccessibleInvitation } from "@/lib/invitation-access";

export const dynamic = "force-dynamic";

export default async function TamuPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;

  const invitation = await findAccessibleInvitation(id, user);
  if (!invitation) notFound();

  const guests = await db.guest.findMany({
    where: { invitationId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <GuestManager
      invitationId={id}
      slug={invitation.slug}
      title={invitation.title}
      initialGuests={guests.map((g) => ({
        id: g.id,
        name: g.name,
        groupName: g.groupName,
        qrToken: g.qrToken,
        checkedInAt: g.checkedInAt?.toISOString() ?? null,
      }))}
    />
  );
}
