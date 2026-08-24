import "server-only";
import { db } from "@/lib/db";

/** Aktifkan undangan sesuai paket yang dibayar. */
export async function activateInvitationForPayment(invitationId: string, planId: string) {
  const durationDays =
    planId === "PREMIUM" ? 3650 : planId === "BASIC" ? 30 : 14;
  const activatedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await db.invitation.update({
    where: { id: invitationId },
    data: {
      status: "ACTIVE",
      plan: planId,
      activatedUntil,
    },
  });
}
