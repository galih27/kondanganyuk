import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeInvitationData } from "@/lib/invitation-data";
import { InvitationEditor } from "@/components/dashboard/editor/invitation-editor";
import { findAccessibleInvitation } from "@/lib/invitation-access";

export const dynamic = "force-dynamic";

export default async function EditUndanganPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;

  const invitation = await findAccessibleInvitation(id, user);
  if (!invitation) notFound();

  const data = normalizeInvitationData(JSON.parse(invitation.data || "{}"));

  const [wishCount, guestCount, lastPayment] = await Promise.all([
    db.wish.count({ where: { invitationId: id } }),
    db.guest.count({ where: { invitationId: id } }),
    db.payment.findFirst({ where: { invitationId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <InvitationEditor
      initial={{
        id: invitation.id,
        slug: invitation.slug,
        category: invitation.category,
        themeId: invitation.themeId,
        themeArt: invitation.themeArt,
        themePalette: invitation.themePalette,
        waTemplate: invitation.waTemplate,
        ogImage: invitation.ogImage,
        title: invitation.title,
        status: invitation.status,
        plan: invitation.plan,
        views: invitation.views,
        activatedUntil: invitation.activatedUntil?.toISOString() ?? null,
        data,
        wishCount,
        guestCount,
        lastPaymentStatus: lastPayment?.status ?? null,
        lastOrderId: lastPayment?.orderId ?? null,
      }}
    />
  );
}
