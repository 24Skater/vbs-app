"use client";

import { useRef } from "react";

interface RoleSelectProps {
  userId: string;
  userEmail: string;
  currentRole: string;
  roleColors: Record<string, string>;
  updateAction: (formData: FormData) => Promise<void>;
}

export default function RoleSelect({
  userId,
  userEmail,
  currentRole,
  roleColors,
  updateAction,
}: RoleSelectProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (confirm(`Change ${userEmail} role to ${newRole}?`)) {
      formRef.current?.requestSubmit();
    } else {
      // Reset to original value
      if (selectRef.current) {
        selectRef.current.value = currentRole;
      }
    }
  };

  return (
    <form ref={formRef} action={updateAction} className="inline">
      <input type="hidden" name="userId" value={userId} />
      <select
        ref={selectRef}
        name="role"
        defaultValue={currentRole}
        onChange={handleChange}
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          roleColors[currentRole] || roleColors.VIEWER
        } border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer`}
      >
        <option value="ADMIN">ADMIN</option>
        <option value="STAFF">STAFF</option>
        <option value="VIEWER">VIEWER</option>
      </select>
    </form>
  );
}

