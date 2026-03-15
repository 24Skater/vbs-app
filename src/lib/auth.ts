/**
 * Authentication utilities and helpers
 */
import "server-only";
import { authOptions } from "@/lib/auth-config";
import { UnauthorizedError, ForbiddenError } from "./errors";
import { UserRole } from "./constants";

/**
 * Get the current session (server-side)
 * For NextAuth v5 beta, use auth() function
 */
export async function getSession() {
  // NextAuth v5 beta - use auth() function
  const { auth } = await import("@/lib/auth-instance");
  return await auth();
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthorizedError("You must be logged in to access this resource");
  }
  return session;
}

/**
 * Require a specific role - throws if user doesn't have the role
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await requireAuth();
  const userRole = session.user.role as UserRole;

  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 3,
    STAFF: 2,
    VIEWER: 1,
  };

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new ForbiddenError(
      `This action requires ${requiredRole} role or higher`
    );
  }

  return session;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    await requireRole(requiredRole);
    return true;
  } catch {
    return false;
  }
}
