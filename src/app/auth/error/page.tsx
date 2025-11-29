import Link from "next/link";

type Props = {
  searchParams: {
    error?: string;
  };
};

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication.",
};

export default function AuthErrorPage({ searchParams }: Props) {
  const error = searchParams.error || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
        </div>
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="block w-full rounded-md bg-gray-100 px-4 py-2 text-center text-gray-700 hover:bg-gray-200"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
