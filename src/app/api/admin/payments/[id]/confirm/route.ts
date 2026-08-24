import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { activateInvitationForPayment } from "@/lib/activation";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

// Konfirmasi pembayaran manual oleh admin (misal transfer manual / verifikasi)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await params;

  const payment = await db.payment.findUnique({
    where: { id },
    include: { invitation: true },
  });
  if (!payment) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  if (payment.status !== "PAID") {
    await db.payment.update({
      where: { id },
      data: { status: "PAID", method: payment.method || "MANUAL", paidAt: new Date() },
    });
  }
  if (payment.invitationId) {
    await activateInvitationForPayment(payment.invitationId, payment.plan);
  }
  return NextResponse.json({ ok: true });
}
