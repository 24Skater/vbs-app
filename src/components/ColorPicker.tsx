"use client";

import { useState } from "react";

interface ColorPickerProps {
  name: string;
  defaultValue?: string;
}

export default function ColorPicker({ name, defaultValue = "" }: ColorPickerProps) {
  const [color, setColor] = useState(defaultValue);

  return (
    <div className="mt-1 flex gap-2">
      <input
        type="color"
        value={color || "#2563eb"}
        className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
        onChange={(e) => setColor(e.target.value)}
      />
      <input
        type="text"
        id="color"
        name={name}
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="#2563eb"
        pattern="^#[0-9A-Fa-f]{6}$"
        className="block flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
      />
    </div>
  );
}

