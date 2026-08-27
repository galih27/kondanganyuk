import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeInvitationData } from "@/lib/invitation-data";
import { InvitationEditor } from "@/components/dashboard/editor/invitation-editor";

export const dynamic = "force-dynamic";

export default async function EditUndanganPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;

  const invitation = await db.invitation.findFirst({
    where: { id, ...(user.role === "ADMIN" ? {} : { userId: user.id }) },
    include: {
      _count: { select: { wishes: true, guests: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!invitation) notFound();

  const data = normalizeInvitationData(JSON.parse(invitation.data || "{}"));

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
        wishCount: invitation._count.wishes,
        guestCount: invitation._count.guests,
        lastPaymentStatus: invitation.payments[0]?.status ?? null,
        lastOrderId: invitation.payments[0]?.orderId ?? null,
      }}
    />
  );
}
