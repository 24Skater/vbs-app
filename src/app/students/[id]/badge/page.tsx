import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import PrintBadge from "./PrintBadge";

type Props = { params: Promise<{ id: string }> };

export default async function BadgePage({ params }: Props) {
  await requireRole("STAFF");

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (Number.isNaN(id)) return notFound();

  const [student, settings] = await Promise.all([
    prisma.student.findUnique({
      where: { id },
      include: {
        event: true,
        emergencyContacts: { orderBy: { priority: "asc" }, take: 1 },
        parents: { where: { isPrimary: true }, take: 1 },
      },
    }),
    getSettings(),
  ]);

  if (!student) return notFound();

  const primaryParent = student.parents[0];
  const primaryEmergency = student.emergencyContacts[0];

  // Calculate age
  const age = student.dateOfBirth
    ? Math.floor((Date.now() - new Date(student.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Print Badge</h1>
          <p className="mt-1 text-sm text-gray-600">
            Preview and print badge for {student.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/students/${id}`}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>

      <PrintBadge
        student={{
          name: student.name,
          category: student.category,
          size: student.size,
          grade: student.grade,
          age: age,
          profileImage: student.profileImage || student.profileImageUrl,
          allergies: student.allergies,
          medicalNotes: student.medicalNotes,
        }}
        event={{
          year: student.event.year,
          theme: student.event.theme,
        }}
        emergency={primaryEmergency ? {
          name: primaryEmergency.name,
          phone: primaryEmergency.phone,
          relationship: primaryEmergency.relationship,
        } : primaryParent ? {
          name: primaryParent.name,
          phone: primaryParent.phone || "",
          relationship: primaryParent.relationship,
        } : null}
        settings={{
          siteName: settings.siteName,
          primaryColor: settings.primaryColor,
          logoUrl: settings.logoUrl,
        }}
      />
    </div>
  );
}
