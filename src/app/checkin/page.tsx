import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import CheckinControls from "@/components/CheckinControls";

const EVENT_YEAR = 2024; // TODO: make this configurable later

/* ── Server Action: check a student in for TODAY ───────────────────────── */
export async function checkInById(studentId: number) {
  "use server";

  const event = await prisma.event.findUnique({ where: { year: EVENT_YEAR } });
  if (!event) throw new Error(`Event ${EVENT_YEAR} not found`);

  const { start, end } = todayRange();

  // idempotent: if already checked in today, do nothing
  const already = await prisma.attendance.findFirst({
    where: {
      studentId,
      eventId: event.id,
      date: { gte: start, lt: end },
    },
    select: { id: true },
  });

  if (!already) {
    await prisma.attendance.create({
      data: { studentId, eventId: event.id },
    });
  }

  revalidatePath("/checkin");
}

/* ── Helpers ───────────────────────────────────────────────────────────── */
function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, end };
}

type PageProps = {
  searchParams: {
    q?: string;
    category?: string;
  };
};

export default async function CheckInPage({ searchParams }: PageProps) {
  const q = (searchParams.q ?? "").trim();
  const category = (searchParams.category ?? "").trim() || undefined;

  const event = await prisma.event.findUnique({ where: { year: EVENT_YEAR } });
  if (!event) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Check-In</h1>
        <p className="text-red-600">
          No event for {EVENT_YEAR}. Create it (or run the seed) before using
          Check-In.
        </p>
      </div>
    );
  }

  const { start, end } = todayRange();

  // Load students + whether they have an attendance entry today
  const students = await prisma.student.findMany({
    where: {
      eventId: event.id,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      attendances: {
        where: { eventId: event.id, date: { gte: start, lt: end } },
        select: { id: true },
      },
    },
  });

  // Bind actions for each student (required for <form action={...}>)
  const bound = (id: number) => checkInById.bind(null, id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Check-In</h1>

      <CheckinControls />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => {
          const present = s.attendances.length > 0;
          const action = bound(s.id);

          return (
            <form
              key={s.id}
              action={action}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                present ? "bg-green-50 border-green-200" : "bg-white"
              }`}
            >
              <div>
                <div className="text-lg font-semibold">{s.name}</div>
                <div className="text-sm text-gray-600">
                  {s.category} • {s.size}
                </div>
              </div>

              <button
                type="submit"
                className={
                  present
                    ? "rounded-md bg-gray-200 px-4 py-2 text-gray-700 cursor-default"
                    : "rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                }
                disabled={present}
                title={present ? "Already checked in today" : "Check in now"}
              >
                {present ? "Present" : "Check In"}
              </button>
            </form>
          );
        })}

        {students.length === 0 && (
          <div className="text-gray-500">No students match your search.</div>
        )}
      </div>
    </div>
  );
}
