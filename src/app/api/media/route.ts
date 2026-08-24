import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Batas ukuran per jenis berkas (bytes)
export const LIMITS = {
  IMAGE: 8 * 1024 * 1024, // 8 MB
  VIDEO: 64 * 1024 * 1024, // 64 MB
  AUDIO: 16 * 1024 * 1024, // 16 MB
} as const;

const ALLOWED: Record<keyof typeof LIMITS, RegExp> = {
  IMAGE: /^image\/(jpeg|png|webp|gif|avif)$/,
  VIDEO: /^video\/(mp4|webm|quicktime|x-matroska)$/,
  AUDIO: /^audio\/(mpeg|mp3|wav|x-wav|ogg|m4a|x-m4a|aac|webm)$/,
};

function detectKind(mime: string): keyof typeof LIMITS | null {
  if (ALLOWED.IMAGE.test(mime)) return "IMAGE";
  if (ALLOWED.VIDEO.test(mime)) return "VIDEO";
  if (ALLOWED.AUDIO.test(mime)) return "AUDIO";
  return null;
}

/** Unggah berkas → simpan BLOB di database → kembalikan URL publik. */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Format unggahan tidak valid." }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Tidak ada berkas." }, { status: 400 });

  const results: { url: string; kind: string; filename: string }[] = [];

  for (const file of files) {
    const mime = file.type || "application/octet-stream";
    const kind = detectKind(mime);
    if (!kind) {
      return NextResponse.json({ error: `Jenis berkas "${file.type}" tidak didukung.` }, { status: 415 });
    }
    if (file.size > LIMITS[kind]) {
      const mb = Math.round(LIMITS[kind] / 1024 / 1024);
      return NextResponse.json(
        { error: `"${file.name}" melebihi batas ${mb} MB untuk ${kind.toLowerCase()}.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await db.media.create({
      data: {
        userId: user.id,
        filename: file.name.slice(0, 180) || `berkas-${Date.now()}`,
        mimeType: mime,
        kind,
        size: buffer.byteLength,
        data: new Uint8Array(buffer),
      },
    });
    results.push({ url: `/api/media/${media.id}`, kind, filename: media.filename });
  }

  return NextResponse.json({ ok: true, items: results });
}
