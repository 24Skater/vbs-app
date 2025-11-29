// src/app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { requireAuth } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import Card from "@/components/card";

export default async function Dashboard() {
  await requireAuth();

  try {
    const event = await getActiveEvent();
    const categories = await getCategories(event.id);

    // Get total count
    const total = await prisma.student.count({ where: { eventId: event.id } });

    // Get counts for each category
    const categoryCounts = await Promise.all(
      categories.map(async (category) => ({
        name: category.name,
        count: await prisma.student.count({
          where: { eventId: event.id, category: category.name },
        }),
      }))
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            {event.year} {event.theme && `• ${event.theme}`}
          </p>
        </div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total Students" value={total} />
          {categoryCounts.map(({ name, count }) => (
            <Card key={name} title={name} value={count} />
          ))}
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            {error instanceof Error
              ? error.message
              : "No active event found. Please activate an event in the admin panel."}
          </p>
        </div>
      </div>
    );
  }
}
