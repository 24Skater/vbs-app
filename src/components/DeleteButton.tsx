"use client";

import { useRef } from "react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}

export default function DeleteButton({
  action,
  confirmMessage,
  children,
  className = "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700",
}: DeleteButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

