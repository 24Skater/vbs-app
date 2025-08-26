"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function CheckinControls() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const category = sp.get("category") ?? "";

  // update the URL (and re-render server) when q or category changes
  function update(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    startTransition(() => router.push(`/checkin?${params.toString()}`));
  }

  // small debounce for search typing
  useEffect(() => {
    const t = setTimeout(() => update({ q }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="block text-sm text-gray-600">Search name</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to search…"
          autoFocus
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-3 text-lg"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Category</label>
        <select
          className="mt-1 w-48 rounded-md border border-gray-300 px-3 py-3"
          defaultValue={category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">All</option>
          <option value="Youth">Youth</option>
          <option value="Jovenes">Jóvenes</option>
          <option value="Teacher/Assistant">Teachers/Assistants</option>
        </select>
      </div>

      <button
        onClick={() => {
          setQ("");
          update({ q: "", category: "" });
        }}
        disabled={pending}
        className="h-[46px] rounded-md bg-gray-100 px-4 text-sm hover:bg-gray-200"
      >
        Reset
      </button>
    </div>
  );
}
