import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
});

async function main() {
  const w = await db.wish.findFirst({ where: { guestName: "Uji Koneksi" } });
  console.log("Data di Supabase:", w ? "ADA ✓" : "TIDAK ADA", "|", w?.message, "|", w?.attendance);
  const counts = {
    users: await db.user.count(),
    invitations: await db.invitation.count(),
    wishes: await db.wish.count(),
    guests: await db.guest.count(),
    media: await db.media.count(),
    payments: await db.payment.count(),
  };
  console.log("Rekap tabel:", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
