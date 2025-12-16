"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  inviteToken?: string;
  invitedEmail?: string;
  invitedRole?: string;
  primaryColor?: string;
}

export default function RegisterForm({
  inviteToken,
  invitedEmail,
  invitedRole,
  primaryColor = "#2563eb",
}: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      inviteToken: inviteToken || undefined,
    };

    const confirmPassword = formData.get("confirmPassword") as string;

    // Client-side validation
    if (data.password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Handle validation errors
          const errors: Record<string, string> = {};
          result.details.forEach((err: { path: string[]; message: string }) => {
            if (err.path[0]) {
              errors[err.path[0]] = err.message;
            }
          });
          setFieldErrors(errors);
        } else {
          setError(result.error || "Registration failed");
        }
        return;
      }

      // Success - redirect to sign-in
      router.push("/auth/signin?registered=true");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name (optional)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={invitedEmail || ""}
          readOnly={!!invitedEmail}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 ${
            fieldErrors.email
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          } ${invitedEmail ? "bg-gray-50" : ""}`}
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
        {invitedEmail && (
          <p className="mt-1 text-xs text-gray-500">
            This email is set by your invitation
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 ${
            fieldErrors.password
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
          placeholder="••••••••"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          At least 8 characters with uppercase, lowercase, and a number
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 ${
            fieldErrors.confirmPassword
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
          placeholder="••••••••"
        />
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

