import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! }),
});

async function main() {
  await db.invitation.update({
    where: { slug: "dinda-hendra" },
    data: { plan: "PREMIUM", activatedUntil: new Date(Date.now() + 3650 * 24 * 3600 * 1000) },
  });
  await db.payment.deleteMany({
    where: { method: "SIMULASI", orderId: { not: "KY-DEMO0001PAID" } },
  });
  console.log("Demo dikembalikan ke kondisi awal.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
