import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { escapeHtml } from "@/lib/xss-protection";

/* ───────────────────── Server actions ───────────────────── */

export async function checkInAction(studentId: number) {
  "use server";
  const { requireRole } = await import("@/lib/auth");
  const { getActiveEvent } = await import("@/lib/event");
  const { ValidationError } = await import("@/lib/errors");
  
  await requireRole("STAFF");
  
  // Validate studentId
  if (!studentId || !Number.isInteger(studentId) || studentId <= 0) {
    throw new ValidationError("Invalid student ID");
  }

  const event = await getActiveEvent();

  // Verify student exists and belongs to active event (IDOR protection)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, eventId: true },
  });

  if (!student) {
    throw new ValidationError("Student not found");
  }

  if (student.eventId !== event.id) {
    throw new ValidationError("Student does not belong to the active event");
  }

  // Check if already checked in today (idempotent)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const existing = await prisma.attendance.findFirst({
    where: {
      studentId,
      eventId: event.id,
      date: { gte: start, lt: end },
    },
  });

  if (!existing) {
    await prisma.attendance.create({
      data: { studentId, eventId: event.id },
    });
  }

  revalidatePath(`/students/${studentId}`);
}

export async function togglePaidAction(studentId: number) {
  "use server";
  const { requireRole } = await import("@/lib/auth");
  const { getActiveEvent } = await import("@/lib/event");
  const { ValidationError } = await import("@/lib/errors");
  
  await requireRole("STAFF");
  
  // Validate studentId
  if (!studentId || !Number.isInteger(studentId) || studentId <= 0) {
    throw new ValidationError("Invalid student ID");
  }

  const event = await getActiveEvent();

  // Verify student exists and belongs to active event (IDOR protection)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, eventId: true },
  });

  if (!student) {
    throw new ValidationError("Student not found");
  }

  if (student.eventId !== event.id) {
    throw new ValidationError("Student does not belong to the active event");
  }

  const existing = await prisma.payment.findFirst({
    where: { studentId, eventId: event.id },
  });

  if (existing) {
    await prisma.payment.delete({ where: { id: existing.id } });
  } else {
    await prisma.payment.create({
      data: { studentId, eventId: event.id, amount: 0 },
    });
  }

  revalidatePath(`/students/${studentId}`);
}

/* ────────────────────────── Page ────────────────────────── */

type Props = { params: { id: string } };

export default async function StudentProfile({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return notFound();

  const student = await prisma.student.findUnique({
    where: { id },
    include: { event: true },
  });
  if (!student) return notFound();

  const [attendanceCount, lastAttendance, payment] = await Promise.all([
    prisma.attendance.count({
      where: { studentId: id, eventId: student.eventId },
    }),
    prisma.attendance.findFirst({
      where: { studentId: id, eventId: student.eventId },
      orderBy: { date: "desc" },
    }),
    prisma.payment.findFirst({
      where: { studentId: id, eventId: student.eventId },
    }),
  ]);

  const paid = Boolean(payment);

  // Bind server actions with the current id (required for <form action={...}>)
  const checkInBound = checkInAction.bind(null, id);
  const togglePaidBound = togglePaidAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{escapeHtml(student.name)}</h1>
        <Link
          href="/students"
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
        >
          ← Back to list
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Info title="Category" value={escapeHtml(student.category)} />
        <Info title="Shirt size" value={escapeHtml(student.size)} />
        <Info title="Event" value={String(student.event?.year ?? "—")} />
        <Info
          title="Created"
          value={new Date(student.createdAt).toLocaleString()}
        />
        <Info title="Attendance (this event)" value={String(attendanceCount)} />
        <Info
          title="Last check-in"
          value={
            lastAttendance
              ? new Date(lastAttendance.date).toLocaleString()
              : "—"
          }
        />
        <Info title="Payment status" value={paid ? "PAID" : "NOT PAID"} />
        <Info
          title="Paid at"
          value={payment ? new Date(payment.paidAt).toLocaleString() : "—"}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Check In */}
        <form action={checkInBound}>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            type="submit"
          >
            Check In Today
          </button>
        </form>

        {/* Toggle Paid */}
        <form action={togglePaidBound}>
          <button
            className={
              paid
                ? "rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
                : "rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            }
            type="submit"
          >
            {paid ? "Mark Unpaid" : "Mark Paid"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Small display card */
function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-lg">{value}</div>
    </div>
  );
}
