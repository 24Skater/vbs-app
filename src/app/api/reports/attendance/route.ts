import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole("STAFF");

    const searchParams = request.nextUrl.searchParams;
    const eventId = Number(searchParams.get("eventId"));
    const dateStr = searchParams.get("date");
    const categoryFilter = searchParams.get("category");

    if (!eventId || Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Parse date and create date range for that day
    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Build student query
    const studentWhere: Record<string, unknown> = { eventId };
    if (categoryFilter) {
      studentWhere.category = categoryFilter;
    }

    // Get all students for the event
    const students = await prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Get attendance records for the selected date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        eventId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        studentId: true,
        date: true,
      },
    });

    // Create a map of student ID to check-in time
    const attendanceMap = new Map(
      attendanceRecords.map((r) => [r.studentId, r.date.toISOString()])
    );

    // Combine student data with attendance
    const studentsWithAttendance = students.map((student) => ({
      id: student.id,
      name: student.name,
      category: student.category,
      checkedIn: attendanceMap.has(student.id),
      checkInTime: attendanceMap.get(student.id),
    }));

    // Calculate summary
    const total = studentsWithAttendance.length;
    const checkedIn = studentsWithAttendance.filter((s) => s.checkedIn).length;
    const notCheckedIn = total - checkedIn;
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return NextResponse.json({
      students: studentsWithAttendance,
      summary: {
        total,
        checkedIn,
        notCheckedIn,
        percentage,
      },
      date: dateStr,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Attendance report error:", error);
    return NextResponse.json(
      { error: "Failed to generate attendance report" },
      { status: 500 }
    );
  }
}

