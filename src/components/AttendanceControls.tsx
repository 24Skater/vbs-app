"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Props = {
  categories: Array<{ name: string }>;
};

export default function AttendanceControls({ categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  // initial state from URL
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [date, setDate] = useState(sp.get("date") ?? todayISO());
  const [category, setCategory] = useState(sp.get("category") ?? "");

  function update(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    startTransition(() => router.push(`/attendance?${params.toString()}`));
  }

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => update({ q }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div>
        <label className="block text-sm text-gray-600">Date</label>
        <input
          type="date"
          className="mt-1 w-[210px] rounded-md border border-gray-300 px-3 py-3"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            update({ date: e.target.value });
          }}
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm text-gray-600">Search name</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to search…"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-3"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Category</label>
        <select
          className="mt-1 w-56 rounded-md border border-gray-300 px-3 py-3"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            update({ category: e.target.value });
          }}
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => {
          setQ("");
          setCategory("");
          setDate(todayISO());
          update({ q: "", category: "", date: todayISO() });
        }}
        disabled={pending}
        className="h-[46px] rounded-md bg-gray-100 px-4 text-sm hover:bg-gray-200"
      >
        Reset
      </button>
    </div>
  );
}

function todayISO() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
