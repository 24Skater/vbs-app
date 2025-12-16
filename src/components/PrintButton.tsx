"use client";

interface PrintButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function PrintButton({
  className = "rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700",
  children = "🖨️ Print",
}: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
    >
      {children}
    </button>
  );
}

