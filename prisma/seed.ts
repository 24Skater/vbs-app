import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Initialize default categories if none exist
  const categoryCount = await prisma.studentCategory.count();
  if (categoryCount === 0) {
    await prisma.studentCategory.createMany({
      data: [
        { name: "Youth", order: 1, eventId: null },
        { name: "Jovenes", order: 2, eventId: null },
        { name: "Teacher/Assistant", order: 3, eventId: null },
      ],
    });
    console.log("Created default categories");
  }

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
