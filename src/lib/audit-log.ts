/**
 * Audit logging for security-sensitive operations
 */
import "server-only";
import { prisma } from "./prisma";

export type AuditAction =
  | "USER_ROLE_CHANGED"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "EVENT_DELETED"
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED"
  | "SETTINGS_UPDATED"
  | "STUDENT_CREATED"
  | "STUDENT_UPDATED"
  | "STUDENT_DELETED"
  | "STUDENT_CHECKED_IN"
  | "PAYMENT_TOGGLED"
  | "ATTENDANCE_DELETED"
  | "SESSION_CREATED"
  | "SESSION_DELETED"
  | "AUTH_FAILED"
  | "AUTHORIZATION_FAILED";

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 * Note: In production, consider using a dedicated logging service
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // For now, log to console in development
    // In production, send to logging service (e.g., Winston, Pino, CloudWatch)
    if (process.env.NODE_ENV === "development") {
      console.log("[AUDIT]", {
        timestamp: new Date().toISOString(),
        ...entry,
      });
    }

    // TODO: Store in database or logging service
    // await prisma.auditLog.create({ data: { ... } });
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break the app
    console.error("Failed to write audit log:", error);
  }
}
