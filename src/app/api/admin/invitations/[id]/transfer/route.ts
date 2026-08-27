import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export const dynamic = "force-dynamic";

// Pindahkan kepemilikan undangan ke user lain oleh admin
export async function PATCH(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await params;

  const invitation = await db.invitation.findUnique({ where: { id } });
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const target = String(body.userId || "").trim();
  if (!target) return NextResponse.json({ error: "User tujuan wajib diisi." }, { status: 400 });

  const targetUser = await db.user.findUnique({ where: { id: target } });
  if (!targetUser) return NextResponse.json({ error: "User tujuan tidak ditemukan." }, { status: 404 });

  if (invitation.userId === targetUser.id)
    return NextResponse.json({ error: "Undangan sudah dimiliki user tersebut." }, { status: 400 });

  await db.invitation.update({ where: { id }, data: { userId: targetUser.id } });
  return NextResponse.json({ ok: true });
}
