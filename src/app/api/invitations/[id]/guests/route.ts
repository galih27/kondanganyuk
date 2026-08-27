import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

function normalizePhone(raw: string): string {
  let d = String(raw).replace(/[^0-9]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return d;
}

async function getOwnedInvitation(id: string, userId: string, role: string) {
  return db.invitation.findFirst({ where: { id, ...(role === "ADMIN" ? {} : { userId }) } });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;
  const invitation = await getOwnedInvitation(id, user.id, user.role);
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
  const guests = await db.guest.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, phone: true, groupName: true },
  });
  return NextResponse.json({ guests });
}

export async function POST(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;
  const invitation = await getOwnedInvitation(id, user.id, user.role);
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  // Dukung tambah massal: { items: [{ name, phone }] }
  const items: Array<{ name?: unknown; phone?: unknown; groupName?: unknown }> = Array.isArray(body.items)
    ? body.items
    : [body];
  const rows = items
    .map((it) => ({
      name: typeof it.name === "string" ? it.name.trim() : "",
      phone: typeof it.phone === "string" ? normalizePhone(it.phone) : "",
      groupName: typeof it.groupName === "string" && it.groupName.trim() ? it.groupName.trim() : null,
    }))
    .filter((r) => r.name.length > 0 && r.name.length <= 120)
    .map((r) => ({ ...r, phone: r.phone || null, invitationId: invitation.id }));

  if (rows.length === 0) return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });

  const created = await db.guest.createMany({ data: rows });
  const guests = await db.guest.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, phone: true, groupName: true },
  });
  return NextResponse.json({ added: created.count, guests });
}
