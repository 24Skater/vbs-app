import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import StudentsFilters from "@/components/StudentsFilters";
import { parsePagination, getSkip, calculatePagination } from "@/lib/pagination";
import { escapeHtml } from "@/lib/xss-protection";

type Props = {
  searchParams: {
    q?: string;
    category?: string;
    size?: string;
    page?: string;
    pageSize?: string;
  };
};

export default async function StudentsPage({ searchParams }: Props) {
  await requireRole("STAFF");

  const { q = "", category, size } = searchParams;
  const { page, pageSize } = parsePagination(searchParams);

  let event;
  try {
    event = await getActiveEvent();
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
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

  // unique sizes for dropdown
  const sizeRows = await prisma.student.findMany({
    where: { eventId: event.id },
    select: { size: true },
    distinct: ["size"],
    orderBy: { size: "asc" },
  });
  const sizes = sizeRows.map((r) => r.size);
  const categories = await getCategories(event.id);

  // Get total count for pagination
  const total = await prisma.student.count({
    where: {
      eventId: event.id,
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : undefined),
      ...(category ? { category } : undefined),
      ...(size ? { size } : undefined),
    },
  });

  // Get paginated students
  const students = await prisma.student.findMany({
    where: {
      eventId: event.id,
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : undefined),
      ...(category ? { category } : undefined),
      ...(size ? { size } : undefined),
    },
    orderBy: { name: "asc" },
    skip: getSkip(page, pageSize),
    take: pageSize,
  });

  const pagination = calculatePagination(total, page, pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Students</h1>

      <StudentsFilters sizes={sizes} categories={categories} />

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
                <td className="px-4 py-2">{escapeHtml(s.name)}</td>
                <td className="px-4 py-2">{escapeHtml(s.size)}</td>
                <td className="px-4 py-2">{escapeHtml(s.category)}</td>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            {pagination.hasPrev && (
              <Link
                href={`/students?${new URLSearchParams({
                  ...searchParams,
                  page: String(pagination.page - 1),
                }).toString()}`}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {pagination.hasNext && (
              <Link
                href={`/students?${new URLSearchParams({
                  ...searchParams,
                  page: String(pagination.page + 1),
                }).toString()}`}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{getSkip(page, pageSize) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(getSkip(page, pageSize) + pageSize, pagination.total)}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {pagination.hasPrev && (
                  <Link
                    href={`/students?${new URLSearchParams({
                      ...searchParams,
                      page: String(pagination.page - 1),
                    }).toString()}`}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <Link
                      key={pageNum}
                      href={`/students?${new URLSearchParams({
                        ...searchParams,
                        page: String(pageNum),
                      }).toString()}`}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.page
                          ? "z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                {pagination.hasNext && (
                  <Link
                    href={`/students?${new URLSearchParams({
                      ...searchParams,
                      page: String(pagination.page + 1),
                    }).toString()}`}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    Next
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
        </table>
      </div>
    </div>
  );
}
