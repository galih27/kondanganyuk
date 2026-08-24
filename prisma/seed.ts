// Seed data demo Kondanganyuk — seluruh nama, cerita & ucapan adalah fiksi orisinal.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
});

async function main() {
  console.log("🌱 Menanam data demo...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("demo123", 10);

  await db.user.upsert({
    where: { email: "admin@kondanganyuk.com" },
    update: {},
    create: {
      name: "Admin Kondanganyuk",
      email: "admin@kondanganyuk.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const demo = await db.user.upsert({
    where: { email: "demo@kondanganyuk.com" },
    update: {},
    create: {
      name: "Rara Permata",
      email: "demo@kondanganyuk.com",
      passwordHash: demoHash,
      phone: "081234567890",
    },
  });

  // ===== Undangan pernikahan aktif (paket PREMIUM) =====
  const slugWedding = "dinda-hendra";
  const existingWedding = await db.invitation.findUnique({ where: { slug: slugWedding } });

  if (!existingWedding) {
    const weddingData = {
      groomName: "Hendra",
      groomFull: "Hendra Kusuma Wijaya, S.T.",
      groomPhoto: "https://picsum.photos/seed/groom-kondangan/600/800",
      groomParents: "Putra pertama dari Bapak Sutrisno & Ibu Sulastri",
      brideName: "Dinda",
      brideFull: "Dinda Ayu Lestari, S.Psi.",
      bridePhoto: "https://picsum.photos/seed/bride-kondangan/600/800",
      brideParents: "Putri kedua dari Bapak Joko Prasetyo & Ibu Sri Wahyuni",
      dressCode: "Batik",
      personName: "",
      personDetail: "",
      quoteText:
        "Cinta sejati tumbuh ketika dua hati saling menemukan dan bersama-sama melangkah dalam ridha-Nya.",
      quoteSource: "",
      events: [
        {
          name: "Akad Nikah",
          date: "2026-09-12",
          startTime: "08:00",
          endTime: "10:00",
          place: "Masjid Agung Sinar Harapan",
          address: "Jl. Melati Indah No. 45, Kota Bahagia",
          mapsUrl: "",
        },
        {
          name: "Resepsi",
          date: "2026-09-12",
          startTime: "11:00",
          endTime: "14:00",
          place: "Pendopo Agung Tirta Amerta",
          address: "Jl. Kenanga Raya No. 12, Kota Bahagia",
          mapsUrl: "",
        },
      ],
      story: [
        {
          date: "2019-08-17",
          title: "Awal Bertemu",
          text: "Kami dipertemukan di sebuah kegiatan kampus. Obrolan singkat sore itu ternyata menjadi awal dari segalanya.",
        },
        {
          date: "2022-02-14",
          title: "Menjalin Hubungan",
          text: "Setelah lima tahun saling mengenal, kami memutuskan untuk serius dan bertumbuh bersama sebagai pasangan.",
        },
        {
          date: "2026-05-10",
          title: "Lamaran",
          text: "Di hadapan keluarga besar, Hendra meminang Dinda. Doa terbaik kedua keluarga mengiringi langkah kami menuju hari bahagia.",
        },
      ],
      galleryUrls: [
        "https://picsum.photos/seed/kondangan1/600/800",
        "https://picsum.photos/seed/kondangan2/600/800",
        "https://picsum.photos/seed/kondangan3/600/800",
        "https://picsum.photos/seed/kondangan4/600/800",
        "https://picsum.photos/seed/kondangan5/600/800",
        "https://picsum.photos/seed/kondangan6/600/800",
      ],
      musicUrl: "",
      banks: [
        { bank: "BCA", number: "1234567890", holder: "Dinda Ayu Lestari" },
        { bank: "Mandiri", number: "0987654321", holder: "Hendra Kusuma Wijaya" },
      ],
      giftAddress: "Jl. Melati Indah No. 45, RT 03 / RW 05, Kota Bahagia, 12345 (a.n. Keluarga Wijaya)",
      streamingUrl: "",
      closingNote:
        "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.",
    };

    const wedding = await db.invitation.create({
      data: {
        userId: demo.id,
        slug: slugWedding,
        category: "WEDDING",
        themeId: "amara",
        title: "Undangan Dinda & Hendra",
        status: "ACTIVE",
        plan: "PREMIUM",
        activatedUntil: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000),
        views: 128,
        data: JSON.stringify(weddingData),
      },
    });

    await db.guest.createMany({
      data: [
        { invitationId: wedding.id, name: "Bapak Budi Santoso", groupName: "Teman Kantor" },
        { invitationId: wedding.id, name: "Ibu Sari Wulandari", groupName: "Keluarga" },
        { invitationId: wedding.id, name: "Raka Pratama", groupName: "Sahabat Kuliah" },
        { invitationId: wedding.id, name: "Maya Anggraini", groupName: "Sahabat Kuliah" },
        { invitationId: wedding.id, name: "Keluarga Pak Darmawan", groupName: "Tetangga" },
      ],
    });

    await db.wish.createMany({
      data: [
        {
          invitationId: wedding.id,
          guestName: "Ibu Sari Wulandari",
          attendance: "HADIR",
          message: "Selamat atas pernikahannya, semoga menjadi keluarga yang sakinah, mawaddah, warahmah!",
        },
        {
          invitationId: wedding.id,
          guestName: "Raka Pratama",
          attendance: "MASIH_RAGU",
          message: "Barakallahu lakuma... insyaAllah aku usahakan datang, doa terbaik untuk kalian berdua!",
        },
        {
          invitationId: wedding.id,
          guestName: "Maya Anggraini",
          attendance: "BERHALANGAN",
          message: "Maaf aku belum bisa hadir karena tugas luar kota. Selamat ya Dinda & Hendra! Lancar sampai hari H 🤍",
        },
      ],
    });

    // Transaksi pembayaran PAID untuk contoh statistik
    await db.payment.create({
      data: {
        orderId: "KY-DEMO0001PAID",
        userId: demo.id,
        invitationId: wedding.id,
        plan: "PREMIUM",
        amount: 99000,
        method: "SIMULASI",
        status: "PAID",
        paidAt: new Date(),
      },
    });

    console.log("  ✓ Undangan pernikahan aktif:", slugWedding);
  }

  // ===== Undangan khitanan draf =====
  if (!(await db.invitation.findUnique({ where: { slug: "aksa-barokah" } }))) {
    await db.invitation.create({
      data: {
        userId: demo.id,
        slug: "aksa-barokah",
        category: "KHITAN",
        themeId: "barokah",
        title: "Khitanan Aksa",
        status: "DRAFT",
        plan: "FREE",
        data: JSON.stringify({
          groomName: "",
          brideName: "",
          groomFull: "",
          brideFull: "",
          groomParents: "",
          brideParents: "",
          personName: "Aksa Ramadhan",
          personDetail: "Putra pertama dari Bapak Fajar Nugroho & Ibu Nadia Rahma",
          quoteText: "",
          quoteSource: "",
          events: [
            {
              name: "Tasyakuran Khitanan",
              date: "2026-10-04",
              startTime: "09:00",
              endTime: "12:00",
              place: "Kediaman Keluarga",
              address: "Perum Griya Asri Blok C2 No. 8",
              mapsUrl: "",
            },
          ],
          story: [],
          galleryUrls: [],
          musicUrl: "",
          banks: [{ bank: "", number: "", holder: "" }],
          giftAddress: "",
          streamingUrl: "",
          closingNote: "",
        }),
      },
    });
    console.log("  ✓ Undangan khitanan draf: aksa-barokah");
  }

  console.log("\n✅ Seed selesai!");
  console.log("   Admin : admin@kondanganyuk.com / admin123");
  console.log("   Demo  : demo@kondanganyuk.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
