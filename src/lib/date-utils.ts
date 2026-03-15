/**
 * Date utility functions
 */
import "server-only";

/**
 * Get start and end of day for a given date
 * @param date - ISO date string (YYYY-MM-DD) or Date object. If undefined, uses today.
 * @returns Object with start and end Date objects for the day
 */
export function getDayRange(date?: string | Date): { start: Date; end: Date } {
  const base = date ? (typeof date === "string" ? new Date(date) : date) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
  return { start, end };
}

/**
 * Get today's date range (start and end of today)
 */
export function getTodayRange(): { start: Date; end: Date } {
  return getDayRange();
}

/**
 * Format date for datetime-local input
 */
export function toDateTimeLocal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 16); // datetime-local value
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
