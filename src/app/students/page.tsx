import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StudentsFilters from "@/components/StudentsFilters";

type Props = {
  searchParams: {
    q?: string;
    category?: string;
    size?: string;
  };
};

export default async function StudentsPage({ searchParams }: Props) {
  const { q = "", category, size } = searchParams;

  // unique sizes for dropdown
  const sizeRows = await prisma.student.findMany({
    where: { event: { year: 2024 } },
    select: { size: true },
    distinct: ["size"],
    orderBy: { size: "asc" },
  });
  const sizes = sizeRows.map((r) => r.size);

  const students = await prisma.student.findMany({
    where: {
      event: { year: 2024 },
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : undefined),
      ...(category ? { category } : undefined),
      ...(size ? { size } : undefined),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>

      <StudentsFilters sizes={sizes} />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t text-sm">
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{s.size}</td>
                <td className="px-4 py-2">{s.category}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                    href={`/students/${s.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={4}>
                  No students found with current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
