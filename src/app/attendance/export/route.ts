import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EVENT_YEAR = 2024;

function rangeForDate(iso?: string) {
  const base = iso ? new Date(iso) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
  return { start, end };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const event = await prisma.event.findUnique({
    where: { year: EVENT_YEAR },
    select: { id: true, year: true },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { start, end } = rangeForDate(date ?? undefined);

  const records = await prisma.attendance.findMany({
    where: {
      eventId: event.id,
      date: { gte: start, lt: end },
      student: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(category ? { category } : {}),
      },
    },
    include: { student: true },
    orderBy: { date: "asc" },
  });

  const rows = [
    ["Name", "Category", "Size", "Checked In At", "Student ID", "Attendance ID"],
    ...records.map((r) => [
      r.student.name,
      r.student.category,
      r.student.size,
      new Date(r.date).toISOString(),
      String(r.studentId),
      String(r.id),
    ]),
  ];

  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${date ?? "today"}.csv"`,
    },
  });
}

function escape(s: string) {
  if (s == null) return "";
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
