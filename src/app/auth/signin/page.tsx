import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SignInForm from "@/components/SignInForm";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            VBS App
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
