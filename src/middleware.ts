/**
 * Next.js middleware for authentication, authorization, and security headers
 */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { addSecurityHeaders } from "@/lib/security-headers";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Apply security headers to all responses
    let response = NextResponse.next();
    response = addSecurityHeaders(response);

    // Rate limiting for authentication endpoints
    if (path.startsWith("/api/auth/signin") || path.startsWith("/api/auth/callback")) {
      const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = await import("@/lib/constants");
      const identifier = getClientIdentifier(req);
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

    // Admin-only routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Staff-only routes (staff and admin can access)
    const staffRoutes = ["/students", "/checkin", "/attendance", "/schedule"];
    if (
      staffRoutes.some((route) => path.startsWith(route)) &&
      token?.role !== "ADMIN" &&
      token?.role !== "STAFF"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        const publicRoutes = ["/", "/auth"];
        if (publicRoutes.some((route) => path.startsWith(route))) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

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
