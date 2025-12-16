import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireRole("STAFF");

    const searchParams = request.nextUrl.searchParams;
    const eventId = Number(searchParams.get("eventId"));
    const fields = searchParams.get("fields")?.split(",") || ["name", "category", "size"];
    const categoryFilter = searchParams.get("category");
    const teacherIdFilter = searchParams.get("teacherId");

    if (!eventId || Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Build query conditions
    const where: Record<string, unknown> = { eventId };
    if (categoryFilter) {
      where.category = categoryFilter;
    }

    // If filtering by teacher, get student IDs assigned to that teacher
    let studentIds: number[] | null = null;
    if (teacherIdFilter) {
      const teacherAssignments = await prisma.studentTeacher.findMany({
        where: { teacherId: Number(teacherIdFilter) },
        select: { studentId: true },
      });
      studentIds = teacherAssignments.map((a) => a.studentId);
      where.id = { in: studentIds };
    }

    // Fetch students with related data
    const students = await prisma.student.findMany({
      where,
      include: {
        payments: { where: { eventId }, take: 1 },
        attendances: { where: { eventId } },
        parents: { where: { isPrimary: true }, take: 1 },
        emergencyContacts: { orderBy: { priority: "asc" }, take: 1 },
        teachers: { include: { teacher: true } },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Get teacher name for filter display
    let teacherName: string | undefined;
    if (teacherIdFilter) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: Number(teacherIdFilter) },
        select: { name: true },
      });
      teacherName = teacher?.name;
    }

    // Transform data based on requested fields
    const transformedStudents = students.map((student) => {
      const result: Record<string, unknown> = {};

      // Calculate age if needed
      const age = student.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(student.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : null;

      const primaryParent = student.parents[0];
      const primaryEmergency = student.emergencyContacts[0];
      const hasPaid = student.payments.length > 0;

      for (const field of fields) {
        switch (field) {
          case "name":
            result.name = student.name;
            break;
          case "category":
            result.category = student.category;
            break;
          case "size":
            result.size = student.size;
            break;
          case "grade":
            result.grade = student.grade;
            break;
          case "dateOfBirth":
            result.dateOfBirth = student.dateOfBirth?.toISOString();
            break;
          case "age":
            result.age = age;
            break;
          case "parentName":
            result.parentName = primaryParent?.name || student.parentName;
            break;
          case "parentPhone":
            result.parentPhone = primaryParent?.phone || student.parentPhone;
            break;
          case "parentEmail":
            result.parentEmail = primaryParent?.email || student.parentEmail;
            break;
          case "emergencyContact":
            result.emergencyContact = primaryEmergency?.name || student.emergencyContact;
            break;
          case "emergencyPhone":
            result.emergencyPhone = primaryEmergency?.phone || student.emergencyPhone;
            break;
          case "emergencyRelationship":
            result.emergencyRelationship =
              primaryEmergency?.relationship || student.emergencyRelationship;
            break;
          case "allergies":
            result.allergies = student.allergies;
            break;
          case "medicalNotes":
            result.medicalNotes = student.medicalNotes;
            break;
          case "notes":
            result.notes = student.notes;
            break;
          case "paymentStatus":
            result.paymentStatus = hasPaid ? "paid" : "unpaid";
            break;
          case "attendanceCount":
            result.attendanceCount = student.attendances.length;
            break;
          case "createdAt":
            result.createdAt = student.createdAt.toISOString();
            break;
        }
      }

      return result;
    });

    return NextResponse.json({
      students: transformedStudents,
      generatedAt: new Date().toISOString(),
      filters: {
        category: categoryFilter || undefined,
        teacher: teacherName,
      },
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

