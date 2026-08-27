import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ guestId: string }> };

function normalizePhone(raw: string): string {
  let d = String(raw).replace(/[^0-9]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { guestId } = await params;
  const guest = await db.guest.findFirst({
    where: { id: guestId, invitation: user.role === "ADMIN" ? {} : { userId: user.id } },
  });
  if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 120);
  if (body.phone !== undefined) {
    const p = typeof body.phone === "string" ? normalizePhone(body.phone) : "";
    update.phone = p || null;
  }
  if (typeof body.groupName === "string") update.groupName = body.groupName.trim() || null;

  const updated = await db.guest.update({
    where: { id: guest.id },
    data: update,
    select: { id: true, name: true, phone: true, groupName: true },
  });
  return NextResponse.json({ guest: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { guestId } = await params;
  const guest = await db.guest.findFirst({
    where: { id: guestId, invitation: user.role === "ADMIN" ? {} : { userId: user.id } },
  });
  if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan." }, { status: 404 });
  await db.guest.delete({ where: { id: guest.id } });
  return NextResponse.json({ ok: true });
}
