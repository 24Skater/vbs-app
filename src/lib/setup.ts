/**
 * First-launch setup utilities
 */
import "server-only";
import { prisma } from "./prisma";

/**
 * Check if this is a fresh install (no users in database)
 */
export async function isFirstLaunch(): Promise<boolean> {
  try {
    const userCount = await prisma.user.count();
    return userCount === 0;
  } catch (error) {
    // If database isn't ready, treat as first launch
    console.error("Error checking first launch status:", error);
    return true;
  }
}

/**
 * Check if setup is required (no admin users)
 */
export async function needsSetup(): Promise<boolean> {
  try {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    console.log(`[Setup] Admin count: ${adminCount}, needs setup: ${adminCount === 0}`);
    return adminCount === 0;
  } catch (error) {
    console.error("[Setup] Error checking setup status:", error);
    // Don't assume setup is needed on error - this causes redirect loops
    // Instead, return false so users can at least access the site
    return false;
  }
}

