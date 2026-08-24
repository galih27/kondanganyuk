import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createPayment, PAYMENT_CHANNELS } from "@/lib/payment";
import { PLANS, type PlanId } from "@/lib/plans";
import { generateOrderId } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const body = await req.json();
  const invitationId = String(body.invitationId || "");
  const planId = String(body.plan || "") as PlanId;
  const method = String(body.method || "QRIS");

  if (!["BASIC", "PREMIUM"].includes(planId))
    return NextResponse.json({ error: "Paket tidak valid." }, { status: 400 });
  if (!PAYMENT_CHANNELS.some((c) => c.code === method) && method !== "SIMULASI")
    return NextResponse.json({ error: "Metode pembayaran tidak tersedia." }, { status: 400 });

  const invitation = await db.invitation.findFirst({
    where: { id: invitationId, userId: user.id },
  });
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  const plan = PLANS[planId];
  const orderId = generateOrderId();

  const payment = await db.payment.create({
    data: {
      orderId,
      userId: user.id,
      invitationId,
      plan: planId,
      amount: plan.price,
      status: "UNPAID",
    },
  });

  const result = await createPayment({
    orderId,
    amount: plan.price,
    method,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone ?? undefined,
  });

  if (!result.ok) {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", meta: JSON.stringify({ reason: result.instructions }) },
    });
    return NextResponse.json({ error: result.instructions }, { status: 502 });
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      checkoutUrl: result.checkoutUrl,
      payRef: result.payRef,
      method: result.method ?? method,
      meta: JSON.stringify({ instructions: result.instructions }),
    },
  });

  // Tandai undangan menunggu pembayaran
  await db.invitation.update({ where: { id: invitationId }, data: { status: "PENDING" } });

  return NextResponse.json({ ok: true, orderId });
}
