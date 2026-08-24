import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyCallbackSignature, paymentMode } from "@/lib/payment";
import { activateInvitationForPayment } from "@/lib/activation";

// Webhook callback dari Tripay. Tidak memakai sesi; diverifikasi via signature.
export async function POST(req: Request) {
  if (paymentMode() === "SIMULASI")
    return NextResponse.json({ error: "Webhook tidak aktif di mode simulasi." }, { status: 403 });

  const raw = await req.text();
  const signature = req.headers.get("x-callback-signature");
  if (!verifyCallbackSignature(raw, signature))
    return NextResponse.json({ error: "Signature tidak valid." }, { status: 401 });

  let payload: {
    reference?: string;
    merchant_ref?: string;
    status?: string | number;
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const payment = await db.payment.findUnique({
    where: { orderId: payload.merchant_ref || "" },
    include: { invitation: true },
  });
  if (!payment) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  if (payment.payRef && payload.reference && payment.payRef !== payload.reference)
    return NextResponse.json({ error: "Referensi tidak cocok." }, { status: 400 });

  // status Tripay: PAID / UNPAID / FAILED / EXPIRED
  const statusMap: Record<string, string> = {
    PAID: "PAID",
    UNPAID: "UNPAID",
    FAILED: "FAILED",
    EXPIRED: "EXPIRED",
  };
  const newStatus = statusMap[String(payload.status).toUpperCase()] ?? "UNPAID";

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      paidAt: newStatus === "PAID" ? new Date() : null,
    },
  });

  if (newStatus === "PAID" && payment.invitationId) {
    await activateInvitationForPayment(payment.invitationId, payment.plan);
  }

  return NextResponse.json({ success: true });
}
