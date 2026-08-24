import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug wajib." }, { status: 400 });
  const invitation = await db.invitation.findUnique({ where: { slug } });
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  const wishes = await db.wish.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ wishes });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug || "");
    const name = String(body.name || "").trim().slice(0, 60);
    const attendance = ["HADIR", "BERHALANGAN", "MASIH_RAGU"].includes(body.attendance)
      ? body.attendance
      : "HADIR";
    const message = String(body.message || "").trim().slice(0, 500);

    if (!name || !message)
      return NextResponse.json({ error: "Nama dan ucapan wajib diisi." }, { status: 400 });

    const invitation = await db.invitation.findUnique({ where: { slug } });
    if (!invitation || invitation.status === "DRAFT")
      return NextResponse.json({ error: "Undangan tidak tersedia." }, { status: 404 });

    // Rate limit sederhana per undangan
    const recent = await db.wish.count({
      where: {
        invitationId: invitation.id,
        guestName: name,
        createdAt: { gte: new Date(Date.now() - 10 * 1000) },
      },
    });
    if (recent >= 3)
      return NextResponse.json({ error: "Terlalu sering, coba lagi nanti." }, { status: 429 });

    const wish = await db.wish.create({
      data: { invitationId: invitation.id, guestName: name, attendance, message },
    });
    return NextResponse.json({ ok: true, wish });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
