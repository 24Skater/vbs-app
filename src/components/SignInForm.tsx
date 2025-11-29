"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  // Check for account lockout
  useEffect(() => {
    if (email) {
      checkLockoutStatus(email);
    }
  }, [email]);

  async function checkLockoutStatus(email: string) {
    try {
      const response = await fetch(`/api/auth/check-lockout?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.locked) {
          const minutes = Math.ceil((data.remaining || 0) / 60);
          setLockoutMessage(
            `Account locked due to too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`
          );
        } else {
          setLockoutMessage(null);
        }
      }
    } catch {
      // Ignore errors checking lockout status
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setLockoutMessage(null);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        // Re-check lockout status after failed attempt
        if (email) {
          await checkLockoutStatus(email);
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <p className="text-sm text-green-800">
          Check your email for a sign-in link. The link will expire in 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {lockoutMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{lockoutMessage}</p>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "Send magic link"}
      </button>
    </form>
  );
}
