import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify, RESERVED_SLUGS } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

// Admin boleh mengakses undangan milik user lain.
async function findInvitationFor(userId: string, role: string, id: string, include?: object) {
  return db.invitation.findFirst({
    where: { id, ...(role === "ADMIN" ? {} : { userId }) },
    include,
  });
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;
  const invitation = await findInvitationFor(user.id, user.role, id, {
    _count: { select: { wishes: true, guests: true } },
  });
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ invitation });
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;
  const invitation = await findInvitationFor(user.id, user.role, id);
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if (body.data !== undefined) update.data = JSON.stringify(body.data);
  if (body.themeId !== undefined) update.themeId = String(body.themeId);
  if (body.title !== undefined) update.title = String(body.title);
  if (body.waTemplate !== undefined) {
    if (body.waTemplate === null) update.waTemplate = null;
    else if (typeof body.waTemplate === "string") update.waTemplate = body.waTemplate.slice(0, 2000);
  }

  // Gambar OG kustom: hanya URL media internal, null/"" untuk reset otomatis
  if (body.ogImage !== undefined) {
    if (body.ogImage === null || body.ogImage === "") update.ogImage = null;
    else if (typeof body.ogImage === "string" && /^\/api\/media\/[a-z0-9]+$/i.test(body.ogImage)) update.ogImage = body.ogImage;
  }

  // Pengaturan tema kustom: ornamen & palet (JSON string, null = reset ke tema)
  try {
    if (body.themeArt !== undefined) {
      if (body.themeArt === null) update.themeArt = null;
      else {
        const parsed = typeof body.themeArt === "string" ? JSON.parse(body.themeArt) : body.themeArt;
        if (parsed && typeof parsed === "object") update.themeArt = JSON.stringify(parsed);
      }
    }
    if (body.themePalette !== undefined) {
      if (body.themePalette === null) update.themePalette = null;
      else {
        const parsed = typeof body.themePalette === "string" ? JSON.parse(body.themePalette) : body.themePalette;
        if (parsed && typeof parsed === "object") {
          const clean: Record<string, string> = {};
          for (const k of ["bg", "surface", "accent", "accent2", "text", "textMuted"]) {
            if (typeof parsed[k] === "string" && /^#[0-9a-fA-F]{3,8}$/.test(parsed[k])) clean[k] = parsed[k];
          }
          update.themePalette = JSON.stringify(clean);
        }
      }
    }
  } catch {
    return NextResponse.json({ error: "Format pengaturan tema tidak valid." }, { status: 400 });
  }

  if (body.slug !== undefined && body.slug !== invitation.slug) {
    const slug = slugify(String(body.slug));
    if (!slug || RESERVED_SLUGS.has(slug))
      return NextResponse.json({ error: "Link tidak tersedia." }, { status: 400 });
    const exists = await db.invitation.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: "Link sudah dipakai undangan lain." }, { status: 409 });
    update.slug = slug;
  }

  const updated = await db.invitation.update({ where: { id }, data: update });
  return NextResponse.json({ ok: true, slug: updated.slug });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;
  const invitation = await findInvitationFor(user.id, user.role, id);
  if (!invitation) return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
  await db.invitation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
