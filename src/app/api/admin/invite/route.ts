import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createInvitation } from "@/lib/invitations";
import { auditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/constants";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
});

export async function POST(req: Request) {
  try {
    const session = await requireRole("ADMIN");

    const body = await req.json();
    const result = inviteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Create the invitation
    const invitation = await createInvitation(
      normalizedEmail,
      role as UserRole,
      session.user.id
    );

    // Generate the invitation URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/auth/register?token=${invitation.token}`;

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: "SESSION_CREATED",
      resourceType: "Invitation",
      resourceId: invitation.id,
      details: {
        invitedEmail: normalizedEmail,
        role,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    });

    // In production, you would send an email here
    // For now, we'll return the invitation link
    console.log(`📧 Invitation created for ${normalizedEmail}`);
    console.log(`   Role: ${role}`);
    console.log(`   Link: ${inviteUrl}`);
    console.log(`   Expires: ${invitation.expiresAt.toISOString()}`);

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
      },
    });
  } catch (error) {
    console.error("Invitation error:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await requireRole("ADMIN");

    const invitations = await prisma.invitation.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        inviter: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { error: "Failed to get invitations" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Invitation ID required" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    await prisma.invitation.delete({
      where: { id },
    });

    await auditLog({
      userId: session.user.id,
      action: "SESSION_DELETED",
      resourceType: "Invitation",
      resourceId: id,
      details: { email: invitation.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete invitation error:", error);
    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    );
  }
}

