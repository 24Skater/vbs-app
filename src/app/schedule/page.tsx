import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { scheduleSessionSchema } from "@/lib/validation";
import { toDateTimeLocal } from "@/lib/date-utils";
import { MAX_FUTURE_YEARS } from "@/lib/constants";
import Link from "next/link";
import CategorySelect from "@/components/CategorySelect";

/* ─────────────── Server actions ─────────────── */
export async function createSession(formData: FormData) {
  "use server";
  await requireRole("STAFF");

  const event = await getActiveEvent();

  const rawData = {
    title: formData.get("title"),
    start: formData.get("start"),
    end: formData.get("end"),
    location: formData.get("location"),
    group: formData.get("group"),
    notes: formData.get("notes"),
    eventId: event.id,
  };

  const validation = scheduleSessionSchema.safeParse(rawData);
  if (!validation.success) {
    // Don't expose detailed validation errors to users
    throw new Error("Invalid session data. Please check all fields.");
  }

  const data = validation.data;
  if (data.end <= data.start) {
    throw new Error("End time must be after start time.");
  }

  // Additional validation: ensure dates are reasonable
  const now = new Date();
  const maxFuture = new Date(now.getFullYear() + MAX_FUTURE_YEARS, 11, 31);
  if (data.start > maxFuture || data.end > maxFuture) {
    throw new Error(`Session dates cannot be more than ${MAX_FUTURE_YEARS} years in the future.`);
  }

  await prisma.scheduleSession.create({
    data: {
      title: data.title,
      start: data.start,
      end: data.end,
      location: data.location ?? null,
      group: data.group ?? null,
      notes: data.notes ?? null,
      eventId: data.eventId,
    },
  });

  revalidatePath("/schedule");
}

export async function deleteSession(formData: FormData) {
  "use server";
  const { verifySessionAccess } = await import("@/lib/resource-access");
  const { validateId } = await import("@/lib/resource-access");

  await requireRole("STAFF");

  const idInput = formData.get("id");

  // Validate and verify access (IDOR protection)
  const id = validateId(idInput, "Session");
  await verifySessionAccess(id);

  await prisma.scheduleSession.delete({ where: { id } });
  revalidatePath("/schedule");
}

/* ───────────────── Page ───────────────── */

export default async function SchedulePage() {
  await requireRole("STAFF");

  let event;
  try {
    event = await getActiveEvent();
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error instanceof Error
              ? error.message
              : "No active event found. Please activate an event in the admin panel."}
          </p>
        </div>
      </div>
    );
  }

  const sessions = await prisma.scheduleSession.findMany({
    where: { eventId: event.id },
    orderBy: { start: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
      <p className="text-sm text-gray-600">
        Event {event.year} {event.theme ? `• ${event.theme}` : ""}
      </p>

      {/* Add session form */}
      <form
        action={createSession}
        className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
      >
        <h2 className="text-lg font-semibold">Add Session</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            name="title"
            required
            placeholder="Session title"
            className="rounded-md border px-3 py-2"
          />
          <input name="start" type="datetime-local" required className="rounded-md border px-3 py-2" />
          <input name="end" type="datetime-local" required className="rounded-md border px-3 py-2" />
          <input name="location" placeholder="Location" className="rounded-md border px-3 py-2" />
          <CategorySelect />
          <textarea
            name="notes"
            rows={2}
            placeholder="Notes"
            className="sm:col-span-2 lg:col-span-3 rounded-md border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* List existing sessions */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Group</th>
              <th className="px-4 py-2">Notes</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t text-sm">
                <td className="px-4 py-2">{s.title}</td>
                <td className="px-4 py-2">
                  {new Date(s.start).toLocaleString()} –{" "}
                  {new Date(s.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2">{s.location ?? "—"}</td>
                <td className="px-4 py-2">{s.group ?? "All"}</td>
                <td className="px-4 py-2">{s.notes ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  <form action={deleteSession}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={6}>
                  No sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
