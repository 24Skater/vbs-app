import { redirect } from "next/navigation";
import { needsSetup } from "@/lib/setup";
import { getSettings } from "@/lib/settings";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // Block access if setup is already complete
  const setupRequired = await needsSetup();
  if (!setupRequired) {
    redirect("/auth/signin");
  }

  let settings;
  try {
    settings = await getSettings();
  } catch {
    settings = {
      siteName: "VBS App",
      primaryColor: "#2563eb",
      logoUrl: null,
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ color: settings.primaryColor }}
          >
            Welcome to {settings.siteName}
          </h1>
          <p className="mt-2 text-gray-600">
            Let&apos;s set up your first administrator account
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                1
              </span>
              <span>Create Admin Account</span>
            </div>
            <p className="text-sm text-gray-600">
              This account will have full administrative access to manage users,
              events, students, and all settings.
            </p>
          </div>

          <SetupForm primaryColor={settings.primaryColor} />
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          This setup page is only available on first launch.
          <br />
          Once an admin is created, this page will no longer be accessible.
        </p>
      </div>
    </div>
  );
}

