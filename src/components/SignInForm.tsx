"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import OAuthButtons from "./OAuthButtons";

type AuthMode = "magic-link" | "password";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("magic-link");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  // Show success message if user just registered
  const justRegistered = searchParams.get("registered") === "true";

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
      if (authMode === "magic-link") {
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
      } else {
        // Password authentication
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
          // Re-check lockout status after failed attempt
          if (email) {
            await checkLockoutStatus(email);
          }
        } else if (result?.ok) {
          // Successful login - redirect to dashboard
          window.location.href = "/dashboard";
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success && authMode === "magic-link") {
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
      {justRegistered && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Account created successfully! You can now sign in.
          </p>
        </div>
      )}
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

      {/* Auth Mode Toggle */}
      <div className="flex rounded-md border border-gray-300 p-1">
        <button
          type="button"
          onClick={() => setAuthMode("magic-link")}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            authMode === "magic-link"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("password")}
          className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            authMode === "password"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Password
        </button>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>

      {authMode === "password" && (
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? authMode === "magic-link"
            ? "Sending..."
            : "Signing in..."
          : authMode === "magic-link"
          ? "Send magic link"
          : "Sign in"}
      </button>

      {authMode === "password" && (
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Create one
          </Link>
        </p>
      )}

      <OAuthButtons />
    </form>
  );
}
