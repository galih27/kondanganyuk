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

export async function GET(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await params;

  const invitation = await db.invitation.findUnique({
    where: { id },
    include: {
      collaborators: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  return NextResponse.json({ collaborators: invitation.collaborators });
}

// { userId?: string, email?: string } — tambah kolaborator
export async function POST(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });

  const invitation = await db.invitation.findUnique({ where: { id } });
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  let targetUser;
  if (typeof body.userId === "string" && body.userId.trim()) {
    targetUser = await db.user.findUnique({ where: { id: body.userId.trim() } });
  } else if (typeof body.email === "string" && body.email.trim()) {
    targetUser = await db.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
  }
  if (!targetUser) return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });

  if (targetUser.id === invitation.userId)
    return NextResponse.json({ error: "User tersebut sudah menjadi pemilik." }, { status: 400 });

  const exists = await db.invitationCollaborator.findUnique({
    where: { invitationId_userId: { invitationId: id, userId: targetUser.id } },
  });
  if (exists)
    return NextResponse.json({ error: "User sudah menjadi kolaborator." }, { status: 400 });

  await db.invitationCollaborator.create({
    data: { invitationId: id, userId: targetUser.id },
  });

  return NextResponse.json({ ok: true, user: { id: targetUser.id, name: targetUser.name, email: targetUser.email } });
}

// { collaboratorId: string } — hapus kolaborator
export async function DELETE(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const collaboratorId = String(body?.collaboratorId || "").trim();
  if (!collaboratorId) return NextResponse.json({ error: "Kolaborator wajib diisi." }, { status: 400 });

  await db.invitationCollaborator.deleteMany({
    where: { id: collaboratorId, invitationId: id },
  });

  return NextResponse.json({ ok: true });
}
