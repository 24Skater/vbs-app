import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AttendanceControls from "../../components/AttendanceControls";

const EVENT_YEAR = 2024;

/* ---------- Server Action: Undo (delete one attendance row) ---------- */
export async function undoAttendance(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const date = String(formData.get("date") ?? "");
  if (!id) return;

  await prisma.attendance.delete({ where: { id } });

  // revalidate the filtered page the user is on
  revalidatePath(`/attendance${date ? `?date=${date}` : ""}`);
}

/* ------------------------------ Helpers ------------------------------ */
function rangeForDate(iso?: string) {
  // iso = "YYYY-MM-DD" (from <input type="date">)
  const base = iso ? new Date(iso) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
  return { start, end };
}

type PageProps = {
  searchParams: {
    date?: string; // yyyy-mm-dd
    q?: string;
    category?: string;
  };
};

export default async function AttendancePage({ searchParams }: PageProps) {
  const { date, q } = searchParams;
  const category = (searchParams.category ?? "").trim() || undefined;

  const event = await prisma.event.findUnique({
    where: { year: EVENT_YEAR },
    select: { id: true, year: true },
  });
  if (!event) return notFound();

  const { start, end } = rangeForDate(date);

  // Pull today's attendance (filtered)
  const records = await prisma.attendance.findMany({
    where: {
      eventId: event.id,
      date: { gte: start, lt: end },
      student: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(category ? { category } : {}),
      },
    },
    include: {
      student: { select: { id: true, name: true, category: true, size: true } },
    },
    orderBy: { date: "desc" },
  });

  // quick counts
  const total = records.length;
  const byCat = records.reduce<Record<string, number>>((acc, r) => {
    const key = r.student.category;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  // Keep current filters for Export CSV link
  const qs = new URLSearchParams();
  if (date) qs.set("date", date);
  if (q) qs.set("q", q);
  if (category) qs.set("category", category);
  const exportHref = `/attendance/export?${qs.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Link
          href={exportHref}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
        >
          Export CSV
        </Link>
      </div>

      <AttendanceControls />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Present" value={String(total)} />
        <Stat title="Youth" value={String(byCat["Youth"] ?? 0)} />
        <Stat title="Jóvenes" value={String(byCat["Jovenes"] ?? 0)} />
        <Stat title="Teachers/Assistants" value={String(byCat["Teacher/Assistant"] ?? 0)} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-t text-sm">
                <td className="px-4 py-2">
                  <Link href={`/students/${r.student.id}`} className="hover:underline">
                    {r.student.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{r.student.category}</td>
                <td className="px-4 py-2">{r.student.size}</td>
                <td className="px-4 py-2">
                  {new Date(r.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 text-right">
                  <form action={undoAttendance}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="date" value={searchParams.date ?? ""} />
                    <button
                      type="submit"
                      className="rounded-md bg-amber-600 px-3 py-1.5 text-white hover:bg-amber-700"
                      title="Remove this check-in"
                    >
                      Undo
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>
                  No attendance records with current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
