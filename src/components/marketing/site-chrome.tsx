import Link from "next/link";

export function SiteHeader({ authed }: { authed: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg text-white shadow-sm">♥</span>
          <span className="text-lg font-semibold tracking-tight">
            Kondangan<span className="text-brand-600">yuk</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          <Link href="/tema" className="hover:text-brand-600">Tema</Link>
          <Link href="/#fitur" className="hover:text-brand-600">Fitur</Link>
          <Link href="/harga" className="hover:text-brand-600">Harga</Link>
          <Link href="/#faq" className="hover:text-brand-600">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/masuk" className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100">
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                Buat Undangan
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">♥</span>
              <span className="font-semibold">Kondanganyuk</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
              Platform undangan digital untuk pernikahan, khitanan, aqiqah, ulang tahun, dan berbagai acara spesial Anda.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Produk</h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              <li><Link href="/tema" className="hover:text-brand-600">Katalog Tema</Link></li>
              <li><Link href="/harga" className="hover:text-brand-600">Harga & Paket</Link></li>
              <li><Link href="/#fitur" className="hover:text-brand-600">Fitur Unggulan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Bantuan</h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              <li><Link href="/#faq" className="hover:text-brand-600">Pertanyaan Umum</Link></li>
              <li><a href="mailto:support@kondanganyuk.com" className="hover:text-brand-600">support@kondanganyuk.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-stone-100 pt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Kondanganyuk. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
