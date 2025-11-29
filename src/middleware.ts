/**
 * Next.js middleware for security headers and basic route protection
 * 
 * Note: Middleware runs in Edge runtime, so we can't use Node.js modules like Prisma.
 * Authentication and authorization are handled in page components using requireAuth/requireRole.
 * This middleware only handles security headers and basic route structure.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addSecurityHeaders } from "@/lib/security-headers";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Apply security headers to all responses
  let response = NextResponse.next();
  response = addSecurityHeaders(response);

  // Rate limiting for authentication endpoints
  if (path.startsWith("/api/auth/signin") || path.startsWith("/api/auth/callback")) {
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    });

    if (!rateLimit.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfter),
            ...Object.fromEntries(response.headers.entries()),
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimit.resetAt));
  }

  // All authentication and authorization is handled in page components
  // This middleware only provides security headers and rate limiting
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
