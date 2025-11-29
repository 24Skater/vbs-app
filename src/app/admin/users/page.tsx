import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { ValidationError } from "@/lib/errors";
import { auditLog } from "@/lib/audit-log";

async function updateUserRole(userId: string, formData: FormData) {
  "use server";
  const session = await requireRole("ADMIN");

  const role = formData.get("role")?.toString();
  
  // Validate role
  if (!role || !["ADMIN", "STAFF", "VIEWER"].includes(role)) {
    throw new ValidationError("Invalid role specified");
  }

  // Get current user role
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!targetUser) {
    throw new ValidationError("User not found");
  }

  // Prevent self-demotion (admin cannot remove their own admin role)
  if (userId === session.user.id && role !== "ADMIN") {
    throw new ValidationError("You cannot remove your own admin role");
  }

  // Prevent removing last admin
  if (targetUser.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    if (adminCount <= 1) {
      throw new ValidationError("Cannot remove the last admin user");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as UserRole },
  });

  // Audit log
  await auditLog({
    userId: session.user.id,
    action: "USER_ROLE_CHANGED",
    resourceType: "User",
    resourceId: userId,
    details: {
      targetUserEmail: targetUser.email,
      oldRole: targetUser.role,
      newRole: role,
    },
  });

  revalidatePath("/admin/users");
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    STAFF: "bg-blue-100 text-blue-800",
    VIEWER: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage user accounts and roles. Users sign in via email magic link.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {user.name || "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <form action={updateUserRole.bind(null, user.id)} className="inline">
                    <select
                      name="role"
                      defaultValue={user.role}
                      onChange={(e) => {
                        if (confirm(`Change ${user.email} role to ${e.target.value}?`)) {
                          e.target.form?.requestSubmit();
                        } else {
                          e.target.value = user.role;
                        }
                      }}
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        roleColors[user.role] || roleColors.VIEWER
                      } border-0 focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="STAFF">STAFF</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </form>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {user.emailVerified ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                      Pending
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No users yet. Users will be created automatically when they sign in.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Users are created automatically when they sign in with their email
          address. To invite a user, ask them to visit the sign-in page and enter their email.
        </p>
      </div>
    </div>
  );
}
