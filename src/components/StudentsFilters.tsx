"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Props = {
  sizes: string[]; // unique sizes to populate the dropdown
  categories: Array<{ name: string }>; // dynamic categories
};

export default function StudentsFilters({ sizes, categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const size = sp.get("size") ?? "";

  function update(next: Record<string, string>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    start(() => router.push(`/students?${p.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="block text-sm text-gray-600">Search name</label>
        <input
          defaultValue={q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Type a name…"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Category</label>
        <select
          className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-2"
          defaultValue={category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Shirt size</label>
        <select
          className="mt-1 w-40 rounded-md border border-gray-300 px-3 py-2"
          defaultValue={size}
          onChange={(e) => update({ size: e.target.value })}
        >
          <option value="">All</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => update({ q: "", category: "", size: "" })}
        disabled={pending}
        className="h-10 rounded-md bg-gray-100 px-4 text-sm hover:bg-gray-200"
      >
        Reset
      </button>
    </div>
  );
}
