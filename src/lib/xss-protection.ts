/**
 * XSS Protection utilities
 * HTML escaping and sanitization for user-generated content
 */
import "server-only";

/**
 * Escape HTML special characters to prevent XSS attacks
 * This is the primary defense against XSS in user-generated content
 */
export function escapeHtml(text: string | number | null | undefined): string {
  if (text == null) return "";
  
  const str = String(text);
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize text for use in HTML attributes
 */
export function escapeAttribute(text: string | number | null | undefined): string {
  return escapeHtml(text);
}

/**
 * Sanitize text for use in URLs
 * Only allow safe characters
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  try {
    const parsed = new URL(url);
    // Only allow http, https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    // Invalid URL, return empty
    return "";
  }
}

/**
 * Validate and sanitize hex color code
 */
export function sanitizeHexColor(color: string | null | undefined): string | null {
  if (!color) return null;
  
  // Must match hex color pattern
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return null;
  }
  
  return color.toUpperCase();
}
