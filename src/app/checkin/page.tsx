import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import CheckinControls from "@/components/CheckinControls";
import { escapeHtml } from "@/lib/xss-protection";

/* ── Server Action: check a student in for TODAY ───────────────────────── */
export async function checkInById(studentId: number) {
  "use server";

  await requireRole("STAFF");

  // Validate studentId
  if (!studentId || !Number.isInteger(studentId) || studentId <= 0) {
    throw new Error("Invalid student ID");
  }

  const event = await getActiveEvent();

  // Verify student exists and belongs to active event (IDOR protection)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, eventId: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.eventId !== event.id) {
    throw new Error("Student does not belong to the active event");
  }

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

  await requireRole("STAFF");

  let event;
  try {
    event = await getActiveEvent();
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Check-In</h1>
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

  const { start, end } = todayRange();
  const categories = await getCategories(event.id);

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

      <CheckinControls categories={categories} />

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
                <div className="text-lg font-semibold">{escapeHtml(s.name)}</div>
                <div className="text-sm text-gray-600">
                  {escapeHtml(s.category)} • {escapeHtml(s.size)}
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
