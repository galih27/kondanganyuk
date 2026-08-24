import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify, RESERVED_SLUGS } from "@/lib/utils";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const body = await req.json();
  const category = String(body.category || "WEDDING");
  const themeId = String(body.themeId || "amara");
  const title = String(body.title || "").trim() || "Undangan Saya";
  let slug = slugify(String(body.slug || title)) || `undangan-${Date.now().toString(36)}`;

  if (RESERVED_SLUGS.has(slug)) slug = `${slug}-undangan`;

  // Pastikan unik: tambah akhiran bila perlu
  let candidate = slug;
  let i = 1;
  while (await db.invitation.findUnique({ where: { slug: candidate } })) {
    candidate = `${slug}-${++i}`;
  }

  const invitation = await db.invitation.create({
    data: {
      userId: user.id,
      slug: candidate,
      category,
      themeId,
      title,
      status: "DRAFT",
      plan: "FREE",
      data: JSON.stringify({}),
    },
  });

  return NextResponse.json({ ok: true, id: invitation.id });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const invitations = await db.invitation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { wishes: true, guests: true } } },
  });
  return NextResponse.json({ invitations });
}
