import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

// Balas ucapan tamu — hanya pemilik undangan
export async function PATCH(req: Request, { params }: Params) {
  const user = (await import("@/lib/auth")).getSessionUser;
  const session = await user();
  if (!session) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;

  const wish = await db.wish.findUnique({
    where: { id },
    include: { invitation: true },
  });
  if (!wish || wish.invitation.userId !== session.id)
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const body = await req.json();
  const reply = String(body.reply || "").trim().slice(0, 300);
  if (!reply) return NextResponse.json({ error: "Balasan kosong." }, { status: 400 });

  await db.wish.update({ where: { id }, data: { reply, repliedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await (await import("@/lib/auth")).getSessionUser();
  if (!session) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;

  const wish = await db.wish.findUnique({
    where: { id },
    include: { invitation: true },
  });
  if (!wish || wish.invitation.userId !== session.id)
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  await db.wish.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
