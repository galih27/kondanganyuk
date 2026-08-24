import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proteksi rute /dashboard dan /admin di Next.js 16 (pengganti middleware).
// Verifikasi penuh JWT dilakukan di server component/route handler;
// proxy hanya memastikan cookie sesi ada agar cepat.

export function proxy(request: NextRequest) {
  const token = request.cookies.get("kondanganyuk_session")?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    const loginUrl = new URL("/masuk", request.url);
    loginUrl.searchParams.set("lanjut", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/ucapanku/:path*"],
};
