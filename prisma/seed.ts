import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create demo event
  const event = await prisma.event.upsert({
    where: { year: 2026 },
    update: {},
    create: { year: 2026, theme: "True North", isActive: true }
  });

  console.log("Seeded event:", event);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
