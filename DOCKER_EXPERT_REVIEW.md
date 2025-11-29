# Docker Expert Review - VBS App

## Current Status
The Docker build is failing during the Next.js build step. The application is a Next.js 15.5.0 app with Prisma ORM and PostgreSQL.

## Error Summary
The build fails at the type checking phase with:
```
Type error: Route "src/app/api/auth/[...nextauth]/route.ts" does not match the required types of a Next.js Route.
"authOptions" is not a valid Route export field.
```

**However**, we've already fixed this issue by moving `authOptions` to a separate file (`src/lib/auth-config.ts`). The error persists, suggesting either:
1. Docker is using cached layers
2. The build context isn't picking up the changes
3. There's a deeper issue with the Docker build process

## Docker Configuration Files

### Dockerfile
- Multi-stage build (base → deps → builder → runner)
- Uses `node:20-alpine`
- Copies Prisma schema before `npm ci` (to satisfy postinstall script)
- Generates Prisma Client in builder stage
- Uses Next.js standalone output mode
- Runs as non-root user (`nextjs`)

### docker-compose.prod.yml
- PostgreSQL 16-alpine database
- App service depends on database health check
- Environment variables passed from `.env` file
- Health checks configured for both services

## Recent Code Changes (Next.js 15 Compatibility)

### Fixed Issues:
1. ✅ `params` are now Promises (fixed in 3 files)
2. ✅ `searchParams` are now Promises (fixed in 5 files)
3. ✅ Route handler exports only HTTP methods (moved `authOptions` to `src/lib/auth-config.ts`)

### Files Modified:
- `src/app/admin/settings/page.tsx`
- `src/app/students/page.tsx`
- `src/app/checkin/page.tsx`
- `src/app/attendance/page.tsx`
- `src/app/auth/error/page.tsx`
- `src/app/admin/categories/[id]/page.tsx`
- `src/app/admin/events/[id]/page.tsx`
- `src/app/students/[id]/page.tsx`
- `src/app/api/auth/[...nextauth]/route.ts` (now only exports GET/POST)
- `src/lib/auth-config.ts` (new file with authOptions)
- `src/lib/auth.ts` (updated import)

## Build Command
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## Potential Issues to Investigate

### 1. Docker Build Cache
- The error message suggests old code is being built
- **Action**: Try `docker compose -f docker-compose.prod.yml build --no-cache`

### 2. Build Context
- Verify all source files are included in build context
- Check `.dockerignore` if it exists
- Ensure `src/lib/auth-config.ts` is being copied

### 3. Next.js Standalone Output
- The Dockerfile expects `.next/standalone` directory
- Verify `next.config.mjs` has `output: "standalone"`
- Check if standalone output is being generated correctly

### 4. Prisma Client Generation
- Prisma Client is generated in builder stage
- Verify it's available in the final image
- Check if Prisma schema is accessible during build

### 5. TypeScript Compilation
- Type checking happens during `npm run build`
- Verify TypeScript can resolve all imports
- Check if `tsconfig.json` is properly configured

### 6. Environment Variables
- Some env vars might be needed at build time
- Check if `DATABASE_URL` or other vars are required during build
- Verify `.env` file is not being used in Docker build (should use docker-compose env)

## Files to Review

### Critical Files:
1. `Dockerfile` - Build process
2. `docker-compose.prod.yml` - Service configuration
3. `next.config.mjs` - Next.js configuration
4. `package.json` - Dependencies and scripts
5. `src/app/api/auth/[...nextauth]/route.ts` - Route handler (should only export GET/POST)
6. `src/lib/auth-config.ts` - Auth configuration (should export authOptions)

### Check for:
- `.dockerignore` file (might be excluding necessary files)
- `tsconfig.json` (TypeScript configuration)
- `.env` file structure (for reference, not used in Docker build)

## Recommended Debugging Steps

1. **Clear all Docker cache:**
   ```bash
   docker compose -f docker-compose.prod.yml down -v
   docker system prune -a --volumes
   ```

2. **Build without cache:**
   ```bash
   docker compose -f docker-compose.prod.yml build --no-cache
   ```

3. **Check build context:**
   ```bash
   docker build --no-cache -t vbs-app-test .
   ```

4. **Inspect the builder stage:**
   - Add a step to list files in builder stage
   - Verify `src/lib/auth-config.ts` exists

5. **Test Next.js build locally:**
   ```bash
   npm run build
   ```
   (Should work if code changes are correct)

6. **Check for .dockerignore:**
   - If it exists, verify it's not excluding source files

## Environment Requirements

### Required Environment Variables:
- `POSTGRES_PASSWORD` - Database password
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `EMAIL_FROM` - Email sender address
- `EMAIL_SERVER_HOST` - SMTP server host
- `EMAIL_SERVER_PORT` - SMTP server port
- `EMAIL_SERVER_USER` - SMTP username
- `EMAIL_SERVER_PASSWORD` - SMTP password
- `EMAIL_SERVER_SECURE` - Use TLS (true/false)

## Tech Stack
- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript 5.4.5
- **ORM**: Prisma 5.17.0
- **Database**: PostgreSQL 16
- **Auth**: NextAuth.js v5.0.0-beta.20
- **Node**: 20-alpine

## Questions for Docker Expert

1. Is the multi-stage build structure optimal for this Next.js app?
2. Are we correctly handling Prisma Client generation and copying?
3. Is the standalone output mode being used correctly?
4. Should we be using build-time environment variables?
5. Are there any Alpine Linux compatibility issues with the dependencies?
6. Is the build cache causing stale code to be used?
7. Should we add a `.dockerignore` file to optimize the build?

## Next Steps
1. Review Dockerfile and docker-compose.prod.yml
2. Verify build context includes all necessary files
3. Test build process step by step
4. Check for caching issues
5. Verify Next.js standalone output configuration
6. Test locally first, then in Docker

