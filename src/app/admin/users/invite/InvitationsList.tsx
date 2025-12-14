"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  inviter: {
    name: string | null;
    email: string;
  };
}

interface InvitationsListProps {
  invitations: Invitation[];
}

export default function InvitationsList({ invitations }: InvitationsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/invite?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch {
      // Ignore errors
    } finally {
      setDeletingId(null);
    }
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    STAFF: "bg-blue-100 text-blue-800",
    VIEWER: "bg-gray-100 text-gray-800",
  };

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getTimeRemaining(expiresAt: Date) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} left`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""} left`;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Invited By
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Expires
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {invitations.map((invitation) => (
            <tr key={invitation.id}>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                {invitation.email}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    roleColors[invitation.role] || roleColors.VIEWER
                  }`}
                >
                  {invitation.role}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                {invitation.inviter.name || invitation.inviter.email}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                <span title={formatDate(invitation.expiresAt)}>
                  {getTimeRemaining(invitation.expiresAt)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                <button
                  onClick={() => handleDelete(invitation.id)}
                  disabled={deletingId === invitation.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deletingId === invitation.id ? "Canceling..." : "Cancel"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

