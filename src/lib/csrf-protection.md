# CSRF Protection Documentation

## Overview

This application uses NextAuth.js v5 with Next.js Server Actions, which provides built-in CSRF protection.

## How CSRF Protection Works

### NextAuth.js Built-in Protection

NextAuth.js v5 automatically provides CSRF protection for:
- Authentication endpoints (`/api/auth/*`)
- Uses double-submit cookie pattern
- Validates CSRF tokens on all authentication requests

### Next.js Server Actions Protection

Next.js Server Actions (used throughout this application) have built-in CSRF protection:
- **Automatic CSRF token validation** - Next.js automatically validates CSRF tokens for all server actions
- **Origin checking** - Validates request origin matches the application origin
- **SameSite cookies** - Session cookies use SameSite=Lax by default (configurable)

### Additional Security Measures

1. **Security Headers** (implemented in `src/middleware.ts`):
   - `X-Frame-Options: DENY` - Prevents clickjacking
   - `Content-Security-Policy` - Restricts resource loading

2. **Authorization Checks** (implemented in all server actions):
   - All server actions require authentication
   - Role-based access control prevents unauthorized actions
   - Resource ownership validation (IDOR protection)

3. **Session Management**:
   - Database-backed sessions (more secure than JWT)
   - Session tokens are cryptographically secure
   - Sessions expire after 30 days of inactivity

## Verification

### Testing CSRF Protection

1. **Server Actions**: Try submitting a form from a different origin - should fail
2. **Authentication**: Try authenticating with a forged CSRF token - should fail
3. **Session Cookies**: Verify cookies have `SameSite` attribute set

### Manual Verification Steps

```bash
# Test CSRF protection on server actions
curl -X POST https://your-app.com/api/students \
  -H "Origin: https://evil-site.com" \
  -H "Cookie: next-auth.session-token=..." \
  # Should be rejected

# Test authentication CSRF protection
curl -X POST https://your-app.com/api/auth/signin \
  -H "Origin: https://evil-site.com" \
  # Should be rejected
```

## Configuration

### NextAuth Configuration

CSRF protection is enabled by default in NextAuth.js. No additional configuration needed.

### Server Actions

No additional configuration needed - Next.js handles CSRF protection automatically.

### Custom CSRF Token (if needed)

If you need custom CSRF tokens for API routes (not server actions), you can use:

```typescript
import { getCsrfToken } from "next-auth/react";

// In client component
const csrfToken = await getCsrfToken();
```

## Recommendations

1. ✅ **Current Implementation**: Sufficient for most use cases
2. ⚠️ **For API Routes**: If adding custom API routes (not server actions), ensure they validate CSRF tokens
3. ⚠️ **For External Integrations**: If integrating with external services, use API keys or OAuth, not session-based auth

## References

- [Next.js Server Actions Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#security)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
