"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Don't show navigation on auth pages or home page (home has its own nav)
  if (pathname?.startsWith("/auth") || pathname === "/") {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  if (status === "loading") {
    return (
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-lg font-semibold text-gray-900">VBS App</div>
          <div className="text-sm text-gray-500">Loading...</div>
        </nav>
      </header>
    );
  }

  if (!session) {
    return (
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            VBS App
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        </nav>
      </header>
    );
  }

  const canAccessStaffRoutes =
    session.user.role === "ADMIN" || session.user.role === "STAFF";

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-lg font-semibold text-gray-900 hover:text-gray-700"
            >
              VBS App
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  isActive("/dashboard")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              {canAccessStaffRoutes && (
                <>
                  <Link
                    href="/students"
                    className={`text-sm font-medium ${
                      isActive("/students")
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Students
                  </Link>
                  <Link
                    href="/checkin"
                    className={`text-sm font-medium ${
                      isActive("/checkin")
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Check-In
                  </Link>
                  <Link
                    href="/attendance"
                    className={`text-sm font-medium ${
                      isActive("/attendance")
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Attendance
                  </Link>
                  <Link
                    href="/schedule"
                    className={`text-sm font-medium ${
                      isActive("/schedule")
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Schedule
                  </Link>
                </>
              )}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium ${
                    pathname?.startsWith("/admin")
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {session.user.email}
              {session.user.role && (
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {session.user.role}
                </span>
              )}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
