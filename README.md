# Kondanganyuk — Platform Undangan Digital

Aplikasi web SaaS untuk membuat **undangan digital** (pernikahan, khitanan, aqiqah, ulang tahun, event) lengkap dengan dashboard pembuat undangan, tema siap pakai, RSVP & buku ucapan, amplop digital, QR check-in tamu, serta sistem pembayaran & aktivasi otomatis.

> Seluruh kode, desain tema, dan konten demo pada proyek ini dibuat orisinal.

---

## ✨ Fitur

**Untuk pembuat undangan**
- 🎨 8 tema original (elegan, islami, playful, minimalis) — bisa ganti kapan saja
- 🔗 Link undangan custom (`/nama-anda`) + link personal per tamu (`?to=Nama Tamu`)
- 📝 Editor konten: mempelai/anak, kutipan, rangkaian acara, garis waktu cerita, galeri foto, musik latar, live streaming, catatan penutup
- 🎁 Amplop digital: daftar rekening/e-wallet dengan tombol salin + alamat kirim hadiah fisik
- 👥 Manajemen tamu massal (`Nama | Grup` per baris) + tombol bagikan WhatsApp otomatis
- 🙏 Ucapan & RSVP tamu dengan fitur balasan
- 📱 QR check-in tamu (kamera + input manual) dengan statistik kehadiran
- 📊 Statistik kunjungan & jumlah ucapan

**Untuk bisnis**
- 💳 Pembayaran via Tripay (QRIS, VA BCA/BRI/BNI, Alfamart, Indomaret) atau **mode simulasi** saat development
- ⚡ Aktivasi undangan otomatis setelah pembayaran terkonfirmasi (webhook)
- 📦 Paket: Gratis / Basic / Premium dengan pembatasan fitur (watermark, galeri, musik, QR)
- 🛠️ Panel admin: statistik pendapatan, konfirmasi transaksi manual, pantau pengguna

---

## 🧰 Tech Stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Bahasa | TypeScript |
| UI | Tailwind CSS v4 |
| Database | SQLite (dev) via Prisma 7 + driver adapter |
| Auth | JWT httpOnly cookie (jose) + bcryptjs |
| Pembayaran | Tripay API (+ mode simulasi) |
| QR Scanner | html5-qrcode |

---

## 🚀 Menjalankan Proyek

```bash
# 1. Install dependensi
npm install

# 2. Setup database (migrasi + generate client)
npx prisma migrate dev

# 3. Isi data demo
npm run db:seed

# 4. Jalankan
npm run dev
```

Buka http://localhost:3000

### Akun Demo

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@kondanganyuk.com` | `admin123` |
| Pengguna | `demo@kondanganyuk.com` | `demo123` |

Undangan contoh aktif: `/dinda-hendra` — coba tambahkan `?to=Bapak+Budi` di belakang URL.

### Script

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Build & produksi |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npm run db:seed` | Isi data demo |
| `npm run db:migrate` | Migrasi skema |

---

## 💳 Konfigurasi Pembayaran

Secara default aplikasi berjalan dalam **mode SIMULASI** (tombol "Simulasikan Pembayaran" muncul di halaman pesanan) sehingga seluruh alur order → bayar → aktivasi dapat dites tanpa uang sungguhan.

Untuk pembayaran nyata, daftar di [tripay.co.id](https://tripay.co.id), lalu isi `.env`:

```env
TRIPAY_MODE=production        # atau sandbox untuk uji coba
TRIPAY_API_KEY=xxxxxxxx
TRIPAY_PRIVATE_KEY=xxxxxxxx
TRIPAY_MERCHANT_CODE=xxxxxxx
```

Setel **URL callback** di dashboard merchant Tripay ke:

```
https://domain-anda.com/api/payments/tripay-callback
```

Signature callback diverifikasi HMAC-SHA512 sesuai spesifikasi Tripay.

---

## 🗂️ Struktur Proyek

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── harga/ · tema/            # Halaman marketing
│   ├── masuk/ · daftar/          # Autentikasi
│   ├── [slug]/                   # ⭐ Undangan publik (render tema)
│   ├── dashboard/
│   │   ├── baru/                 # Wizard buat undangan
│   │   └── undangan/[id]/
│   │       ├── (editor)          # Tab: konten, acara, cerita, galeri, amplop, tema
│   │       ├── tamu/             # Manajemen tamu massal
│   │       ├── ucapan/           # RSVP & balasan
│   │       └── checkin/          # QR scanner layar sambut
│   ├── pesanan/[orderId]/        # Invoice & status pembayaran
│   ├── admin/                    # Panel admin
│   └── api/                      # Route handlers (auth, invitations, wishes, payments)
├── components/
│   ├── marketing/                # Header/footer, kartu pratinjau tema
│   ├── dashboard/                # Editor, manajer tamu/ucapan, checkin
│   ├── themes/                   # ⭐ Engine renderer undangan (cover, countdown, RSVP…)
│   └── admin/
├── lib/
│   ├── themes.ts                 # Registry 8 tema (palet, font, ornamen)
│   ├── plans.ts                  # Paket harga & aturan fitur
│   ├── invitation-data.ts        # Tipe data konten undangan
│   ├── payment.ts                # Integrasi Tripay/simulasi
│   ├── activation.ts             # Logika aktivasi undangan
│   └── auth.ts · db.ts · utils.ts
├── proxy.ts                      # Proteksi rute (Next 16, pengganti middleware)
prisma/
├── schema.prisma                 # User, Invitation, Guest, Wish, Payment
└── seed.ts                       # Data demo fiksi
```

---

## ➕ Menambah Tema Baru

1. Daftarkan preset di `src/lib/themes.ts` (palet warna, gaya font, ornamen, tipe cover).
2. Selesai — renderer `src/components/themes/invitation-view.tsx` otomatis memakai preset tersebut. Kombinasi palet × font × ornamen × cover menghasilkan identitas visual yang berbeda tanpa duplikasi komponen.

## ➕ Mengganti Kategori Acara

Konten undangan bersifat generik: kategori `WEDDING` menampilkan pasangan mempelai, kategori lain menampilkan `personName`. Label tersedia di `src/lib/invitation-data.ts`.

---

## ☁️ Deploy ke Vercel

SQLite hanya untuk development. Untuk produksi:

1. Siapkan PostgreSQL (mis. [Neon](https://neon.tech) atau Vercel Postgres).
2. Ubah provider di `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Ganti adapter di `src/lib/db.ts` dari `PrismaBetterSqlite3` menjadi `PrismaPg` (`@prisma/adapter-pg`) — sesuaikan juga `prisma.config.ts`.
4. Jalankan `npx prisma migrate deploy`, lalu deploy ke Vercel dan set env: `DATABASE_URL`, `AUTH_SECRET` (string acak panjang), `APP_URL`, serta kredensial Tripay bila dipakai.

> Catatan penyimpanan gambar/musik saat ini berbasis URL eksternal. Untuk upload langsung, pertimbangkan Vercel Blob atau S3.

---

## 🔐 Catatan Keamanan

- Password di-hash bcrypt; sesi memakai JWT httpOnly cookie.
- Semua endpoint dashboard/admin memverifikasi sesi & kepemilikan data.
- Callback Tripay diverifikasi signature sebelum mengubah status pembayaran.
- Ganti `AUTH_SECRET` di `.env` sebelum produksi.

## 🗺️ Ide Pengembangan Berikutnya

- Upload file langsung (Vercel Blob) untuk galeri & musik
- Custom domain per undangan
- Program reseller (role `RESELLER` sudah disiapkan di skema)
- Notifikasi email/WhatsApp saat transaksi berhasil
- Export Excel daftar tamu & rekap RSVP
