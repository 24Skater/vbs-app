import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function StudentProfile({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return notFound();

  const student = await prisma.student.findUnique({
    where: { id },
    include: { event: true },
  });

  if (!student) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <Link
          href="/students"
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
        >
          ← Back to list
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Category</div>
          <div className="text-lg">{student.category}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Shirt size</div>
          <div className="text-lg">{student.size}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Event</div>
          <div className="text-lg">{student.event?.year ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Created</div>
          <div className="text-lg">
            {new Date(student.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
