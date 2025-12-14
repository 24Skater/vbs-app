import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { validateInvitation } from "@/lib/invitations";
import RegisterForm from "./RegisterForm";
import Link from "next/link";

interface RegisterPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getSession();
  const params = await searchParams;

  if (session) {
    redirect("/dashboard");
  }

  // Check if there's a valid invitation token
  let invitation = null;
  if (params.token) {
    invitation = await validateInvitation(params.token);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            VBS App
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
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
        />
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

