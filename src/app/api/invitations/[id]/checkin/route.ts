import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { findAccessibleInvitation } from "@/lib/invitation-access";

type Params = { params: Promise<{ id: string }> };

// Check-in tamu via QR / token
export async function POST(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;

  const invitation = await findAccessibleInvitation(id, user);
  if (!invitation) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const body = await req.json();
  const token = String(body.qrToken || "").trim() || String(body.name || "").trim();
  if (!token) return NextResponse.json({ error: "Token/kosong." }, { status: 400 });

  // Cari berdasarkan qrToken; kalau tidak ketemu, coba nama (untuk check-in manual)
  let guest = await db.guest.findFirst({
    where: { OR: [{ qrToken: token }, { invitationId: id, name: token }] },
  });
  if (!guest || guest.invitationId !== id) {
    guest = await db.guest.findFirst({ where: { invitationId: id, name: token } });
  }
  if (!guest)
    return NextResponse.json({ error: `Tamu "${token}" tidak ditemukan.`, ok: false }, { status: 404 });
  if (guest.checkedInAt)
    return NextResponse.json({
      ok: false,
      alreadyCheckedIn: true,
      name: guest.name,
      at: guest.checkedInAt,
      message: `${guest.name} sudah check-in sebelumnya.`,
    });

  guest = await db.guest.update({
    where: { id: guest.id },
    data: { checkedInAt: new Date() },
  });
  return NextResponse.json({ ok: true, name: guest.name, groupName: guest.groupName });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;
  const invitation = await findAccessibleInvitation(id, user);
  if (!invitation) return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  const guests = await db.guest.findMany({
    where: { invitationId: id },
    orderBy: [{ checkedInAt: "asc" }, { name: "asc" }],
  });
  const checkedIn = guests.filter((g) => g.checkedInAt);
  return NextResponse.json({
    total: guests.length,
    checkedInCount: checkedIn.length,
    guests,
  });
}
