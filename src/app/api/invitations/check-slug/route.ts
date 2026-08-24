import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify, RESERVED_SLUGS } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ available: false }, { status: 401 });
  const raw = new URL(req.url).searchParams.get("slug") || "";
  const slug = slugify(raw);
  if (!slug || RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({ available: false, reason: "Link tidak tersedia" });
  }
  const exists = await db.invitation.findUnique({ where: { slug } });
  return NextResponse.json({
    available: !exists,
    slug,
    reason: exists ? "Sudah dipakai" : undefined,
  });
}
