import { requireRole } from "@/lib/auth";
import { getPendingInvitations } from "@/lib/invitations";
import Link from "next/link";
import InviteForm from "./InviteForm";
import InvitationsList from "./InvitationsList";

export default async function InviteUserPage() {
  await requireRole("ADMIN");

  const pendingInvitations = await getPendingInvitations();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invite User</h2>
          <p className="mt-1 text-sm text-gray-600">
            Send an invitation to a new user with a pre-assigned role.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Users
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          New Invitation
        </h3>
        <InviteForm />
      </div>

      {pendingInvitations.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Pending Invitations ({pendingInvitations.length})
          </h3>
          <InvitationsList invitations={pendingInvitations} />
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Invitations expire after 7 days. The invited user
          will receive the assigned role when they sign up using the invitation link.
        </p>
      </div>
    </div>
  );
}

