/**
 * Account lockout and authentication security
 */
import "server-only";
import { prisma } from "./prisma";
import {
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  LOCKOUT_WINDOW_MS,
  ONE_MINUTE_MS,
} from "./constants";

export interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
}

// In-memory store for login attempts (use Redis in production)
const loginAttempts = new Map<string, LoginAttempt[]>();

// Clean up old attempts periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const oneHourAgo = new Date(Date.now() - LOCKOUT_WINDOW_MS);
    loginAttempts.forEach((attempts, email) => {
      const recent = attempts.filter((a) => a.timestamp > oneHourAgo);
      if (recent.length === 0) {
        loginAttempts.delete(email);
      } else {
        loginAttempts.set(email, recent);
      }
    });
  }, 5 * ONE_MINUTE_MS); // Clean every 5 minutes
}

/**
 * Record a login attempt
 */
export function recordLoginAttempt(email: string, success: boolean): void {
  const attempts = loginAttempts.get(email) || [];
  attempts.push({
    email,
    timestamp: new Date(),
    success,
  });
  loginAttempts.set(email, attempts);
}

/**
 * Check if account is locked due to too many failed attempts
 */
export function isAccountLocked(email: string): boolean {
  const attempts = loginAttempts.get(email) || [];
  const oneHourAgo = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const recentAttempts = attempts.filter((a) => a.timestamp > oneHourAgo);

  if (recentAttempts.length < MAX_LOGIN_ATTEMPTS) {
    return false;
  }

  // Check if all recent attempts failed
  const failedAttempts = recentAttempts.filter((a) => !a.success);
  if (failedAttempts.length < MAX_LOGIN_ATTEMPTS) {
    return false;
  }

  // Check if lockout period has passed
  const lastFailedAttempt = failedAttempts[failedAttempts.length - 1];
  const lockoutExpires = new Date(
    lastFailedAttempt.timestamp.getTime() + LOCKOUT_DURATION_MS
  );

  return new Date() < lockoutExpires;
}

/**
 * Get remaining lockout time in seconds
 */
export function getLockoutRemaining(email: string): number | null {
  if (!isAccountLocked(email)) {
    return null;
  }

  const attempts = loginAttempts.get(email) || [];
  const oneHourAgo = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const recentAttempts = attempts.filter((a) => a.timestamp > oneHourAgo);
  const failedAttempts = recentAttempts.filter((a) => !a.success);

  if (failedAttempts.length < MAX_LOGIN_ATTEMPTS) {
    return null;
  }

  const lastFailedAttempt = failedAttempts[failedAttempts.length - 1];
  const lockoutExpires = new Date(
    lastFailedAttempt.timestamp.getTime() + LOCKOUT_DURATION_MS
  );

  const remaining = Math.ceil((lockoutExpires.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Get remaining attempts before lockout
 */
export function getRemainingAttempts(email: string): number {
  const attempts = loginAttempts.get(email) || [];
  const oneHourAgo = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const recentAttempts = attempts.filter((a) => a.timestamp > oneHourAgo);
  const failedAttempts = recentAttempts.filter((a) => !a.success);

  return Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts.length);
}
