import { getActiveEvent } from "@/lib/event";
import { getCategories } from "@/lib/categories";

export default async function CategorySelect() {
  try {
    const event = await getActiveEvent();
    const categories = await getCategories(event.id);

    return (
      <select name="group" className="rounded-md border px-3 py-2">
        <option value="">All</option>
        {categories.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    );
  } catch {
    return (
      <select name="group" className="rounded-md border px-3 py-2">
        <option value="">All</option>
      </select>
    );
  }
}
