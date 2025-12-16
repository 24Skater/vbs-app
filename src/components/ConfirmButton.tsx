"use client";

interface ConfirmButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}

export default function ConfirmButton({
  action,
  confirmMessage,
  children,
  className = "text-red-600 hover:text-red-900",
}: ConfirmButtonProps) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} className="inline">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

