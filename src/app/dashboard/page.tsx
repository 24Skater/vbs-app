// src/app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Card from "@/components/Card";

export default async function Dashboard() {
  const event2024 = await prisma.event.findUnique({ where: { year: 2024 } });

  if (!event2024) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <p className="text-gray-600">
          No “2024” event found. Run your Prisma migration/seed, or create the event first.
        </p>
      </div>
    );
  }

  const [total, youth, jovenes, staff] = await Promise.all([
    prisma.student.count({ where: { eventId: event2024.id } }),
    prisma.student.count({ where: { eventId: event2024.id, category: "Youth" } }),
    prisma.student.count({ where: { eventId: event2024.id, category: "Jovenes" } }),
    prisma.student.count({ where: { eventId: event2024.id, category: "Teacher/Assistant" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Dashboard</h1>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Students" value={total} />
        <Card title="Youth" value={youth} />
        <Card title="Jóvenes" value={jovenes} />
        <Card title="Teachers/Assistants" value={staff} />
      </section>
    </div>
  );
}
