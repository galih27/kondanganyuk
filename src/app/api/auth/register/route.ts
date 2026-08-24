import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim() || null;
    const password = String(body.password || "");

    if (name.length < 2) return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar, silakan masuk." }, { status: 409 });
    }

    const user = await db.user.create({
      data: { name, email, phone, passwordHash: await hashPassword(password) },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
