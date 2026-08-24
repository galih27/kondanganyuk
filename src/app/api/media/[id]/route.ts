import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/** Sajikan berkas dari database. Mendukung HTTP Range agar video/audio bisa di-seek. */
export async function GET(req: Request, { params }: Params) {
  const { id } = await params;
  // Bentuk id cuid — tolak sisanya agar query hemat
  if (!/^[a-z0-9]{20,32}$/i.test(id)) {
    return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  }

  const media = await db.media.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 });

  const bytes = new Uint8Array(media.data);
  const total = bytes.byteLength;
  const baseHeaders: Record<string, string> = {
    "Content-Type": media.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(media.filename)}`,
  };

  const rangeHeader = req.headers.get("range");
  const match = rangeHeader ? /bytes=(\d*)-(\d*)/.exec(rangeHeader) : null;

  if (match) {
    let end = match[2] ? parseInt(match[2], 10) : total - 1;
    const start = match[1] ? parseInt(match[1], 10) : 0;
    if (isNaN(start) || isNaN(end) || start > end || start >= total) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
    }
    end = Math.min(end, total - 1);
    const chunk = bytes.slice(start, end + 1);
    return new Response(chunk, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(chunk.byteLength),
      },
    });
  }

  return new Response(bytes, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(total) },
  });
}

/** Hapus berkas milik sendiri. */
export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  const { id } = await params;

  const media = await db.media.findUnique({ where: { id }, select: { userId: true } });
  if (!media || media.userId !== user.id)
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 403 });

  await db.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
