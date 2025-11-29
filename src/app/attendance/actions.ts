"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { requireRole } from "@/lib/auth";

export async function undoAttendance(formData: FormData) {
  await requireRole("STAFF");

  const idInput = formData.get("id");
  const id = idInput ? Number(idInput) : null;
  const date = String(formData.get("date") ?? "");

  // Validate input
  if (!id || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid attendance ID");
  }

  // Verify attendance exists and belongs to active event (IDOR protection)
  const event = await getActiveEvent();
  const attendance = await prisma.attendance.findUnique({
    where: { id },
    select: { id: true, eventId: true },
  });

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  if (attendance.eventId !== event.id) {
    throw new Error("Attendance record does not belong to the active event");
  }

  await prisma.attendance.delete({ where: { id } });

  // revalidate the filtered page the user is on
  revalidatePath(`/attendance${date ? `?date=${date}` : ""}`);
}

