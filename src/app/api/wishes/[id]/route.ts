import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// Balas / hapus ucapan — pemilik, kolaborator, atau admin undangan.
async function findWishAccess(session: { id: string; role: string }, id: string) {
  if (session.role === "ADMIN") {
    return db.wish.findUnique({ where: { id }, include: { invitation: true } });
  }
  return db.wish.findFirst({
    where: {
      id,
      invitation: {
        OR: [
          { userId: session.id },
          { collaborators: { some: { userId: session.id } } },
        ],
      },
    },
    include: { invitation: true },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;

  const wish = await findWishAccess(session, id);
  if (!wish) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const body = await req.json();
  const reply = String(body.reply || "").trim().slice(0, 300);
  if (!reply) return NextResponse.json({ error: "Balasan kosong." }, { status: 400 });

  await db.wish.update({ where: { id }, data: { reply, repliedAt: new Date() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;

  const wish = await findWishAccess(session, id);
  if (!wish) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  await db.wish.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
