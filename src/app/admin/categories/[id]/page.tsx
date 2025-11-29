import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import { auditLog } from "@/lib/audit-log";

async function updateCategoryAction(id: number, formData: FormData) {
  "use server";
  const session = await requireRole("ADMIN");

  // Validate ID
  if (!id || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Invalid category ID");
  }

  // Verify category exists
  const category = await getCategoryById(id);
  if (!category) {
    throw new ValidationError("Category not found");
  }

  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const color = formData.get("color")?.toString().trim() || null;
  const orderInput = formData.get("order");
  const order = orderInput ? Number(orderInput) : 0;
  const eventIdInput = formData.get("eventId")?.toString();

  // Validate name
  if (!name || name.length === 0) {
    throw new ValidationError("Name is required");
  }
  if (name.length > 100) {
    throw new ValidationError("Name must be 100 characters or less");
  }

  // Validate description
  if (description && description.length > 500) {
    throw new ValidationError("Description must be 500 characters or less");
  }

  // Validate color (hex format)
  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new ValidationError("Color must be a valid hex color (e.g., #FF0000)");
  }

  // Validate order
  if (isNaN(order) || order < 0 || order > 10000) {
    throw new ValidationError("Order must be between 0 and 10000");
  }

  // Validate eventId if provided
  let eventId: number | null = null;
  if (eventIdInput) {
    const parsed = Number(eventIdInput);
    if (isNaN(parsed) || parsed <= 0) {
      throw new ValidationError("Invalid event ID");
    }
    // Verify event exists
    const event = await prisma.event.findUnique({ where: { id: parsed } });
    if (!event) {
      throw new ValidationError("Event not found");
    }
    eventId = parsed;
  }

  await updateCategory(id, {
    name,
    description,
    color,
    order,
    eventId,
  });

  // Audit log
  await auditLog({
    userId: session.user.id,
    action: "CATEGORY_UPDATED",
    resourceType: "Category",
    resourceId: String(id),
    details: { name, eventId },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

async function deleteCategoryAction(id: number) {
  "use server";
  const session = await requireRole("ADMIN");

  // Validate ID
  if (!id || !Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Invalid category ID");
  }

  // Verify category exists
  const category = await getCategoryById(id);
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
  redirect("/admin/categories");
}

type Props = {
  params: { id: string };
};

export default async function EditCategoryPage({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  const category = await getCategoryById(id);
  if (!category) return notFound();

  const events = await prisma.event.findMany({
    select: { id: true, year: true, theme: true },
    orderBy: { year: "desc" },
  });

  const updateAction = updateCategoryAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Category</h2>
        <p className="mt-1 text-sm text-gray-600">Update category details.</p>
      </div>

      <form
        action={updateAction}
        className="space-y-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={category.name}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={category.description || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color (Hex)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="color"
                id="colorPicker"
                defaultValue={category.color || "#2563eb"}
                className="h-10 w-20 rounded border border-gray-300"
                onChange={(e) => {
                  const textInput = document.getElementById("color") as HTMLInputElement;
                  if (textInput) textInput.value = e.target.value;
                }}
              />
              <input
                type="text"
                id="color"
                name="color"
                defaultValue={category.color || ""}
                placeholder="#2563eb"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="block flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              name="order"
              defaultValue={category.order}
              min="0"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="eventId" className="block text-sm font-medium text-gray-700">
            Event (Optional)
          </label>
          <select
            id="eventId"
            name="eventId"
            defaultValue={category.eventId?.toString() || ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Global (all events)</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.year} {event.theme ? `• ${event.theme}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
          <a
            href="/admin/categories"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
