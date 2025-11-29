import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getActiveEvent } from "@/lib/event";
import { getSession } from "@/lib/auth";

// Force dynamic rendering to avoid build-time Prisma calls
export const dynamic = 'force-dynamic';

export default async function Home() {
  const settings = await getSettings();
  const session = await getSession();
  
  // Try to get active event info (optional - don't fail if no event)
  let eventInfo = null;
  try {
    const event = await getActiveEvent();
    eventInfo = {
      year: event.year,
      theme: event.theme,
      startDate: event.startDate,
      endDate: event.endDate,
    };
  } catch {
    // No active event - that's okay for landing page
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-8 w-auto"
                />
              )}
              <span
                className="text-lg font-semibold"
                style={{ color: settings.primaryColor }}
              >
                {settings.siteName}
              </span>
            </div>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            {/* Logo and Site Name */}
            <div className="flex justify-center items-center gap-4 mb-8">
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-16 w-auto"
                />
              )}
              <h1
                className="text-5xl font-extrabold tracking-tight sm:text-6xl"
                style={{ color: settings.primaryColor }}
              >
                {settings.siteName}
              </h1>
            </div>

            {/* Event Info */}
            {eventInfo && (
              <div className="mb-8">
                <p className="text-xl text-gray-600 mb-2">
                  {eventInfo.year} {eventInfo.theme && `• ${eventInfo.theme}`}
                </p>
                {eventInfo.startDate && eventInfo.endDate && (
                  <p className="text-lg text-gray-500">
                    {new Date(eventInfo.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(eventInfo.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Main CTA */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your VBS
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A comprehensive solution for tracking students, attendance, and schedules
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div
                    className="h-10 w-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${settings.primaryColor}20` }}
                  >
                    <svg
                      className="h-6 w-6"
                      style={{ color: settings.primaryColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                  </div>
                  Student Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Easily register and manage students with categories, sizes, and payment tracking.
                  </p>
                </dd>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div
                    className="h-10 w-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${settings.primaryColor}20` }}
                  >
                    <svg
                      className="h-6 w-6"
                      style={{ color: settings.primaryColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Quick Check-In
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Fast and efficient check-in system for daily attendance tracking.
                  </p>
                </dd>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div
                    className="h-10 w-10 flex items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${settings.primaryColor}20` }}
                  >
                    <svg
                      className="h-6 w-6"
                      style={{ color: settings.primaryColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                  </div>
                  Schedule Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Create and manage event schedules with sessions, locations, and groups.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Stats Section (if event exists) */}
      {eventInfo && session?.user && (
        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Get Started
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Access your dashboard to manage students, track attendance, and view reports
              </p>
              <div className="mt-10">
                <Link
                  href="/dashboard"
                  className="rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
