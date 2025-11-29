import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/categories";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { deleteCategory } from "@/lib/categories";
import { requireRole } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { auditLog } from "@/lib/audit-log";

async function deleteCategoryAction(id: number) {
  "use server";
  const session = await requireRole("ADMIN");

  // Validate ID
  if (!id || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Invalid category ID");
  }

  // Verify category exists
  const category = await getCategories().then((cats) =>
    cats.find((c) => c.id === id)
  );
  if (!category) {
    throw new ValidationError("Category not found");
  }

  await deleteCategory(id);

  // Audit log
  await auditLog({
    userId: session.user.id,
    action: "CATEGORY_DELETED",
    resourceType: "Category",
    resourceId: String(id),
    details: { name: category.name },
  });

  revalidatePath("/admin/categories");
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const events = await prisma.event.findMany({
    select: { id: true, year: true, theme: true },
    orderBy: { year: "desc" },
  });

  const eventMap = new Map(events.map((e) => [e.id, e]));

  // Separate global and event-specific categories
  const globalCategories = categories.filter((c) => c.eventId === null);
  const eventCategories = categories.filter((c) => c.eventId !== null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Categories</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage student categories. Global categories apply to all events, while event-specific
            categories only apply to that event.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Category
        </Link>
      </div>

      {/* Global Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Global Categories</h3>
        <p className="mt-1 text-sm text-gray-500">
          These categories are available for all events.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {globalCategories.map((category) => (
                <tr key={category.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {category.color && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-gray-600">{category.color}</span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {category.order}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <form action={deleteCategoryAction.bind(null, category.id)} className="inline">
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            if (
                              !confirm(
                                `Delete category "${category.name}"? This will remove it from all students using it.`
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {globalCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No global categories. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event-Specific Categories */}
      {eventCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Event-Specific Categories</h3>
          <p className="mt-1 text-sm text-gray-500">
            These categories are only available for specific events.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {eventCategories.map((category) => {
                  const event = eventMap.get(category.eventId!);
                  return (
                    <tr key={category.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {event ? `${event.year} ${event.theme ? `• ${event.theme}` : ""}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description || "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <form action={deleteCategoryAction.bind(null, category.id)} className="inline">
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-900"
                              onClick={(e) => {
                                if (
                                  !confirm(
                                    `Delete category "${category.name}"? This will remove it from all students using it.`
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
