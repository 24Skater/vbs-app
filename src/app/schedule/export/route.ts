import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") ?? "2024");
  const event = await prisma.event.findUnique({ where: { year }, select: { id: true, year: true, theme: true } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const sessions = await prisma.session.findMany({
    where: { eventId: event.id },
    orderBy: { start: "asc" },
  });

  const ics = buildICS(sessions, event.theme ?? `VBS ${event.year}`);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="vbs_${event.year}_schedule.ics"`,
    },
  });
}

function dtstamp(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}${pad(x.getUTCSeconds())}Z`;
}

function escapeICS(s?: string | null) {
  if (!s) return "";
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function buildICS(
  sessions: { id: number; title: string; start: Date; end: Date; location: string | null; group: string | null; notes: string | null; }[],
  calendarName: string
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VBS App//Schedule//EN",
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
  ];

  for (const s of sessions) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:vbs-session-${s.id}@example`,
      `DTSTAMP:${dtstamp(new Date())}`,
      `DTSTART:${dtstamp(s.start)}`,
      `DTEND:${dtstamp(s.end)}`,
      `SUMMARY:${escapeICS(s.title)}`,
      s.location ? `LOCATION:${escapeICS(s.location)}` : "",
      `DESCRIPTION:${escapeICS([s.group ?? "All", s.notes ?? ""].filter(Boolean).join(" • "))}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
