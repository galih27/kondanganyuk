import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { CheckinClient } from "@/components/dashboard/checkin-client";
import { findAccessibleInvitation } from "@/lib/invitation-access";

export const dynamic = "force-dynamic";

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;

  const invitation = await findAccessibleInvitation(id, user);
  if (!invitation) notFound();

  const [totalGuests, checkedInCount] = await Promise.all([
    db.guest.count({ where: { invitationId: id } }),
    db.guest.count({ where: { invitationId: id, checkedInAt: { not: null } } }),
  ]);

  return (
    <CheckinClient
      invitationId={id}
      title={invitation.title}
      plan={invitation.plan}
      initialStats={{ total: totalGuests, checkedInCount }}
    />
  );
}
