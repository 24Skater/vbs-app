/**
 * Next.js middleware for security headers and basic route protection
 *
 * Note: Middleware runs in Edge runtime, so we can't use Node.js modules like
 * ioredis, Prisma, or net/tls-dependent packages. Authentication and
 * authorization are handled in page components using requireAuth/requireRole.
 * Rate limiting is applied directly in API route handlers where Node.js APIs
 * are available.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addSecurityHeaders } from "@/lib/security-headers";

export async function middleware(request: NextRequest) {
  // Apply security headers to all responses
  let response = NextResponse.next();
  response = addSecurityHeaders(response);

  // All authentication, authorization, and rate limiting are handled in route
  // handlers and page components — not in Edge middleware.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
