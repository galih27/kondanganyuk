import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { activateInvitationForPayment } from "@/lib/activation";
import { paymentMode } from "@/lib/payment";

// Hanya aktif di mode SIMULASI (env Tripay belum diisi) — untuk development.
export async function POST(req: Request) {
  if (paymentMode() === "TRIPAY")
    return NextResponse.json({ error: "Mode simulasi tidak tersedia." }, { status: 403 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const body = await req.json();
  const orderId = String(body.orderId || "");
  const payment = await db.payment.findUnique({
    where: { orderId },
    include: { invitation: true },
  });
  if (!payment || payment.userId !== user.id)
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (payment.status === "PAID") return NextResponse.json({ ok: true, alreadyPaid: true });

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "PAID", method: "SIMULASI", paidAt: new Date() },
  });

  if (payment.invitationId) {
    await activateInvitationForPayment(payment.invitationId, payment.plan);
  }

  return NextResponse.json({ ok: true });
}
