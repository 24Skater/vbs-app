import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { auditLog } from "@/lib/audit-log";
import ConfirmButton from "@/components/ConfirmButton";

async function toggleTeacherStatus(teacherId: number) {
  "use server";
  const session = await requireRole("ADMIN");

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) return;

  await prisma.teacher.update({
    where: { id: teacherId },
    data: { isActive: !teacher.isActive },
  });

  await auditLog({
    userId: session.user.id,
    action: "SETTINGS_UPDATED",
    resourceType: "Teacher",
    resourceId: String(teacherId),
    details: { isActive: !teacher.isActive },
  });

  revalidatePath("/admin/teachers");
}

async function deleteTeacher(teacherId: number) {
  "use server";
  const session = await requireRole("ADMIN");

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { id: true, name: true },
  });

  if (!teacher) return;

  await prisma.teacher.delete({
    where: { id: teacherId },
  });

  await auditLog({
    userId: session.user.id,
    action: "SETTINGS_UPDATED",
    resourceType: "Teacher",
    resourceId: String(teacherId),
    details: { deleted: teacher.name },
  });

  revalidatePath("/admin/teachers");
}

export default async function TeachersPage() {
  await requireRole("ADMIN");

  const teachers = await prisma.teacher.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: { students: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teachers & Volunteers</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage teachers and volunteers who can be assigned to students.
          </p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Teacher
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className={!teacher.isActive ? "bg-gray-50" : ""}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      {(teacher.profileImage || teacher.profileImageUrl) ? (
                        <img
                          src={teacher.profileImage || teacher.profileImageUrl || ""}
                          alt={teacher.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium">
                          {teacher.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{teacher.name}</div>
                      {teacher.bio && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {teacher.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {teacher.email && <div>{teacher.email}</div>}
                  {teacher.phone && <div>{teacher.phone}</div>}
                  {!teacher.email && !teacher.phone && "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {teacher._count.students} assigned
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <form action={toggleTeacherStatus.bind(null, teacher.id)}>
                    <button
                      type="submit"
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        teacher.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {teacher.isActive ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/teachers/${teacher.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    {teacher._count.students === 0 && (
                      <ConfirmButton
                        action={deleteTeacher.bind(null, teacher.id)}
                        confirmMessage={`Delete ${teacher.name}? This cannot be undone.`}
                      >
                        Delete
                      </ConfirmButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No teachers yet. Add your first teacher to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
