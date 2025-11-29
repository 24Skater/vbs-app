import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { getSettings } from "@/lib/settings";
import Card from "@/components/card";
import Link from "next/link";

export default async function AdminDashboard() {
  const [settings, eventCount, userCount, categoryCount] = await Promise.all([
    getSettings(),
    prisma.event.count(),
    prisma.user.count(),
    prisma.studentCategory.count(),
  ]);

  let activeEvent = null;
  try {
    activeEvent = await getActiveEvent();
  } catch {
    // No active event
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/events">
          <Card title="Events" value={eventCount} hint="Manage VBS events" />
        </Link>
        <Link href="/admin/users">
          <Card title="Users" value={userCount} hint="Manage user accounts" />
        </Link>
        <Link href="/admin/categories">
          <Card title="Categories" value={categoryCount} hint="Student categories" />
        </Link>
        <Card
          title="Active Event"
          value={activeEvent ? `${activeEvent.year}` : "None"}
          hint={activeEvent?.theme || "Set an active event"}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/events/new"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Create New Event
          </Link>
          <Link
            href="/admin/categories/new"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Add Category
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Update Settings
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Current Settings</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Site Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{settings.siteName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Primary Color</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-900">{settings.primaryColor}</span>
              <div
                className="h-6 w-6 rounded border border-gray-300"
                style={{ backgroundColor: settings.primaryColor }}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
