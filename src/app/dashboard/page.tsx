import { prisma } from "@/lib/prisma";   // ✅ correct alias
import Card from "@/components/Card";

export default async function Dashboard() {
  const event2024 = await prisma.event.findUnique({ where: { year: 2024 } });
  const total = await prisma.student.count({ where: { eventId: event2024?.id } });
  const youth = await prisma.student.count({ where: { eventId: event2024?.id, category: "Youth" } });
  const jovenes = await prisma.student.count({ where: { eventId: event2024?.id, category: "Jovenes" } });
  const staff = await prisma.student.count({ where: { eventId: event2024?.id, category: "Teacher/Assistant" } });

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
