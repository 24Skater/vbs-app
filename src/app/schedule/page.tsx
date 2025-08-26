import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const EVENT_YEAR = 2024;

/* ─────────────── Server actions ─────────────── */
export async function createSession(formData: FormData) {
  "use server";
  const event = await prisma.event.findUnique({ where: { year: EVENT_YEAR } });
  if (!event) throw new Error(`Event ${EVENT_YEAR} not found`);

  const title = String(formData.get("title") ?? "").trim();
  const start = new Date(String(formData.get("start")));
  const end = new Date(String(formData.get("end")));
  const location = String(formData.get("location") ?? "").trim() || null;
  const group = String(formData.get("group") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!title || isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Title, start, and end are required.");
  }
  if (end <= start) throw new Error("End time must be after start time.");

  await prisma.session.create({
    data: { title, start, end, location, group, notes, eventId: event.id },
  });

  revalidatePath("/schedule");
}

export async function deleteSession(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Missing id");
  await prisma.session.delete({ where: { id } });
  revalidatePath("/schedule");
}

/* ───────────────── Page ───────────────── */
function toLocal(dt: Date | string) {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  return d.toISOString().slice(0, 16); // datetime-local value
}

export default async function SchedulePage() {
  const event = await prisma.event.findUnique({
    where: { year: EVENT_YEAR },
    select: { id: true, year: true, theme: true },
  });

  if (!event) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p>No event for {EVENT_YEAR}. Seed or create the event first.</p>
      </div>
    );
  }

  const sessions = await prisma.session.findMany({
    where: { eventId: event.id },
    orderBy: { start: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Schedule</h1>
      <p className="text-gray-600">
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
          <select name="group" className="rounded-md border px-3 py-2">
            <option value="">All</option>
            <option value="Youth">Youth</option>
            <option value="Jovenes">Jóvenes</option>
            <option value="Teacher/Assistant">Teachers/Assistants</option>
          </select>
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
