import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { needsSetup } from "@/lib/setup";
import { validateInvitation } from "@/lib/invitations";
import RegisterForm from "./RegisterForm";
import Link from "next/link";

interface RegisterPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  // Redirect to setup if no admin exists
  const setupRequired = await needsSetup();
  if (setupRequired) {
    redirect("/setup");
  }

  const session = await getSession();
  const params = await searchParams;

  if (session) {
    redirect("/dashboard");
  }

  const settings = await getSettings();

  // Check if there's a valid invitation token
  let invitation = null;
  if (params.token) {
    invitation = await validateInvitation(params.token);
  }

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
                className="h-12 w-auto"
              />
            </div>
          )}
          <h1
            className="text-3xl font-bold"
            style={{ color: settings.primaryColor }}
          >
            {settings.siteName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {invitation
              ? "You've been invited to join"
              : "Create your account"}
          </p>
        </div>

        {invitation && (
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              You&apos;ve been invited by{" "}
              <strong>{invitation.inviter.name || invitation.inviter.email}</strong>{" "}
              to join as <strong>{invitation.role}</strong>.
            </p>
          </div>
        )}

        <RegisterForm
          inviteToken={params.token}
          invitedEmail={invitation?.email}
          invitedRole={invitation?.role}
          primaryColor={settings.primaryColor}
        />
        
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link 
            href="/auth/signin" 
            className="font-medium hover:opacity-80"
            style={{ color: settings.primaryColor }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
