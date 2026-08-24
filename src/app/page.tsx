import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-chrome";
import { ThemePreviewCard } from "@/components/marketing/theme-preview-card";
import { PLANS } from "@/lib/plans";
import { THEMES } from "@/lib/themes";
import { formatRupiah } from "@/lib/utils";

const FEATURES = [
  {
    icon: "🎨",
    title: "8+ Tema Original",
    text: "Desain elegan, islami, playful, hingga minimalis. Semua dibuat oleh tim kami dan terus bertambah.",
  },
  {
    icon: "🔗",
    title: "Link Personal per Tamu",
    text: "Setiap tamu dapat link dengan namanya sendiri — undangan terasa lebih personal dan eksklusif.",
  },
  {
    icon: "💌",
    title: "RSVP & Ucapan Real-time",
    text: "Tamu bisa konfirmasi kehadiran dan meninggalkan doa. Anda bisa membalas langsung dari dashboard.",
  },
  {
    icon: "⏳",
    title: "Hitung Mundur & Kalender",
    text: "Countdown menuju hari-H plus tombol simpan ke Google Calendar agar tamu tidak lupa.",
  },
  {
    icon: "📍",
    title: "Peta & Petunjuk Arah",
    text: "Lokasi acara terhubung Google Maps. Tamu tinggal klik untuk navigasi ke lokasi.",
  },
  {
    icon: "🎵",
    title: "Musik Latar",
    text: "Tambahkan lagu favorit untuk mengiringi suasana saat tamu membuka undangan.",
  },
  {
    icon: "🖼️",
    title: "Galeri Foto & Momen",
    text: "Bagikan galeri foto prewedding atau momen spesial kalian dalam tampilan yang rapi.",
  },
  {
    icon: "🎁",
    title: "Amplop Digital",
    text: "Terima hadiah secara cashless lewat rekening yang Anda cantumkan, lengkap tombol salin otomatis.",
  },
  {
    icon: "📱",
    title: "QR Check-in Tamu",
    text: "Buku tamu digital dengan QR code — layar sambut di lokasi acara jadi modern tanpa ribet.",
  },
];

const FAQS = [
  {
    q: "Apakah benar bisa gratis?",
    a: "Ya. Paket Gratis dapat digunakan untuk mencoba seluruh proses pembuatan undangan dan aktif 14 hari dengan watermark. Untuk fitur penuh tanpa watermark, tersedia paket Basic dan Premium.",
  },
  {
    q: "Bagaimana cara kerja aktivasi undangan?",
    a: "Buat undangan gratis, isi semua datanya, lalu lihat hasilnya. Jika sudah cocok, pilih paket dan selesaikan pembayaran (QRIS, VA bank, gerai retail, e-wallet). Undangan otomatis aktif begitu pembayaran terkonfirmasi.",
  },
  {
    q: "Apa itu link personal per tamu?",
    a: "Anda bisa menambahkan daftar nama tamu di dashboard. Sistem membuat link unik seperti kondanganyuk.com/dinda-hendra?to=Bapak+Budi sehingga setiap tamu merasa diundang secara khusus.",
  },
  {
    q: "Apakah bisa dipakai untuk acara selain pernikahan?",
    a: "Bisa. Selain pernikahan, Kondanganyuk mendukung khitanan, aqiqah, ulang tahun, hingga event syukuran perusahaan dengan tema yang sesuai.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami menerima QRIS (semua e-wallet), Virtual Account BCA/BRI/BNI, serta pembayaran tunai di Alfamart dan Indomaret melalui mitra pembayaran Tripay.",
  },
  {
    q: "Bisakah saya edit undangan setelah disebar?",
    a: "Selama undangan masih aktif Anda bebas mengubah konten kapan saja. Perubahan langsung tampak pada link yang sudah tersebar.",
  },
];

export default async function LandingPage() {
  const user = await getSessionUser();
  const showcaseThemes = ["amara", "sakura", "lentera", "malam", "sabrina", "ceria"];

  return (
    <div className="min-h-screen">
      <SiteHeader authed={!!user} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center md:pt-24">
          <span className="anim-fade-in inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-medium text-brand-700 shadow-sm">
            ✨ Lebih dari 500 pasangan telah memakai Kondanganyuk
          </span>
          <h1 className="anim-fade-up mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-6xl">
            Undangan Digital <span className="font-script text-brand-600">Elegan</span> dalam Hitungan Menit
          </h1>
          <p className="anim-fade-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-600 md:text-lg" style={{ animationDelay: "0.15s" }}>
            Buat website undangan pernikahan, khitanan, aqiqah & acara lainnya.
            Pilih tema, isi data, bagikan link personal ke setiap tamu — selesai.
          </p>
          <div className="anim-fade-up mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/daftar"
              className="rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-300 transition hover:bg-brand-700"
            >
              Coba Gratis Sekarang
            </Link>
            <Link
              href="/tema"
              className="rounded-full border border-stone-300 bg-white px-7 py-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              Lihat Tema
            </Link>
          </div>

          {/* Mock browser */}
          <div className="anim-fade-up mx-auto mt-14 max-w-2xl rounded-t-2xl border border-stone-200 bg-white shadow-2xl" style={{ animationDelay: "0.45s" }}>
            <div className="flex items-center gap-1.5 border-b border-stone-100 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 flex-1 truncate rounded-md bg-stone-100 px-3 py-1 text-left text-xs text-stone-500">
                kondanganyuk.com/dinda-hendra?to=Bapak+Budi
              </span>
            </div>
            <div className="bg-gradient-to-b from-stone-100 to-white px-6 py-10">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-500">Undangan Pernikahan</p>
              <p className="mt-3 font-script text-5xl text-stone-800">Dinda &amp; Hendra</p>
              <p className="mt-3 text-sm tracking-widest text-stone-500">SABTU, 12 SEPTEMBER 2026</p>
              <p className="mx-auto mt-4 max-w-sm text-sm italic leading-relaxed text-stone-500">
                &ldquo;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan
                untukmu pasangan hidup dari jenismu sendiri.&rdquo;
              </p>
              <span className="anim-ring mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white">
                ✉️ Buka Undangan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section id="fitur" className="border-t border-stone-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Fitur Lengkap</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Semua yang Anda butuhkan, ada di sini
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">
              Dari link personal sampai buku tamu QR — fokus rayakan hari bahagia Anda,
              biarkan urusan teknis beres sendiri.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl transition group-hover:bg-brand-100">{f.icon}</span>
                <h3 className="mt-4 font-semibold text-stone-800">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMA */}
      <section className="bg-gradient-to-b from-white to-brand-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Katalog Tema</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Pilih gaya yang paling menggambarkan Anda
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {showcaseThemes.map((id) => (
              <ThemePreviewCard key={id} id={id} href={`/tema#${id}`} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/tema" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Lihat semua tema →
            </Link>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Cara Kerja</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              4 langkah, undangan siap disebar
            </h2>
          </div>
          <ol className="mx-auto mt-12 max-w-3xl space-y-0">
            {[
              ["Daftar & buat undangan", "Registrasi gratis lalu pilih kategori acara dan tema favorit Anda."],
              ["Isi data acara", "Nama mempelai/anak, tanggal, lokasi, galeri foto, musik, dan amplop digital."],
              ["Pratinjau & tambah tamu", "Cek hasil akhirnya, lalu masukkan daftar nama tamu untuk link personal."],
              ["Aktifkan & sebarkan", "Bayar sekali, undangan aktif otomatis. Sebar via WhatsApp atau Instagram."],
            ].map(([title, text], i) => (
              <li key={title} className="relative flex gap-5 pb-8 last:pb-0">
                {i < 3 && <span className="absolute left-[22px] top-11 h-full w-px bg-brand-200" aria-hidden />}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white shadow-md shadow-brand-200">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-semibold text-stone-800">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* HARGA RINGKAS */}
      <section id="harga" className="bg-gradient-to-b from-white to-stone-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Harga</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Terjangkau, sekali bayar
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-stone-600">
              Tanpa biaya bulanan. Mulai gratis dulu, upgrade kapan pun Anda siap.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {Object.values(PLANS).map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                  plan.highlight ? "border-brand-500 shadow-xl shadow-brand-100" : "border-stone-200 shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                    Paling Populer
                  </span>
                )}
                <h3 className="text-lg font-semibold text-stone-800">{plan.name}</h3>
                <p className="mt-1 text-sm text-stone-500">{plan.tagline}</p>
                <p className="mt-4 text-3xl font-bold text-stone-900">
                  {plan.price === 0 ? "Gratis" : formatRupiah(plan.price)}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f.label} className={`flex items-start gap-2 ${f.included ? "text-stone-700" : "text-stone-300 line-through"}`}>
                      <span>{f.included ? "✓" : "✕"}</span>
                      {f.label}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/daftar"
                  className={`mt-6 rounded-full px-5 py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-brand-600 text-white shadow-md shadow-brand-200 hover:bg-brand-700"
                      : "border border-stone-300 text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  {plan.price === 0 ? "Mulai Gratis" : `Pilih ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/harga" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Bandingkan semua fitur →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Pertanyaan yang sering diajukan
            </h2>
          </div>
          <div className="mt-10 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-800 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 text-brand-500 transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-stone-900 py-20">
        <div className="pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Hari bahagia Anda layak diingat selamanya
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-stone-300">
            Buat undangan digital pertama Anda sekarang — gratis, tanpa kartu kredit.
          </p>
          <Link
            href="/daftar"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:bg-brand-600"
          >
            Mulai Buat Undangan
          </Link>
        </div>
      </section>

      <SiteFooter />
      <span className="hidden">{THEMES.length}</span>
    </div>
  );
}
