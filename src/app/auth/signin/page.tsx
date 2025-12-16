import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import SignInForm from "@/components/SignInForm";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        {/* Logo and Branding */}
        <div className="text-center">
          {settings.logoUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="h-16 w-auto"
              />
            </div>
          )}
          <h1
            className="text-3xl font-bold"
            style={{ color: settings.primaryColor }}
          >
            {settings.siteName}
          </h1>
          {settings.tagline && (
            <p className="mt-1 text-sm text-gray-500">{settings.tagline}</p>
          )}
          {settings.churchName && (
            <p className="mt-2 text-sm text-gray-600">{settings.churchName}</p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Welcome Message */}
        {settings.welcomeMessage && (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">{settings.welcomeMessage}</p>
          </div>
        )}

        {/* Sign In Form */}
        <SignInForm primaryColor={settings.primaryColor} />

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
