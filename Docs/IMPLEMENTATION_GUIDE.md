# VBS App Implementation Guide

> **Purpose**: Code patterns, templates, and technical specifications for implementing the roadmap.  
> **Companion to**: `PRODUCTION_ROADMAP.md`

---

## 🔧 Environment Variables (Final)

Add these to `.env.example`:

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vbsdb?schema=public"
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=vbsdb
POSTGRES_USER=postgres

# ===========================================
# NEXTAUTH
# ===========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# ===========================================
# EMAIL (Magic Links)
# ===========================================
EMAIL_FROM=noreply@yourchurch.org
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_SERVER_SECURE=false

# ===========================================
# OAUTH - GOOGLE (Optional)
# ===========================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ===========================================
# OAUTH - MICROSOFT/AZURE AD (Optional)
# ===========================================
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common

# ===========================================
# REDIS (Production)
# ===========================================
REDIS_URL=redis://localhost:6379

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
PORT=3000
```

---

## 📦 Phase 1: OAuth Implementation

### 1.1 Google OAuth Provider

**File: `src/lib/auth-config.ts`**

```typescript
import GoogleProvider from "next-auth/providers/google";

// Add to providers array:
...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
] : []),
```

**File: `src/components/OAuthButtons.tsx`** (NEW)

```typescript
"use client";

import { signIn } from "next-auth/react";

interface OAuthButtonsProps {
  callbackUrl?: string;
}

export default function OAuthButtons({ callbackUrl = "/dashboard" }: OAuthButtonsProps) {
  const hasGoogle = process.env.NEXT_PUBLIC_HAS_GOOGLE_OAUTH === "true";
  const hasMicrosoft = process.env.NEXT_PUBLIC_HAS_MICROSOFT_OAUTH === "true";

  if (!hasGoogle && !hasMicrosoft) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid gap-3">
        {hasGoogle && (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <GoogleIcon className="h-5 w-5" />
            Google
          </button>
        )}

        {hasMicrosoft && (
          <button
            type="button"
            onClick={() => signIn("azure-ad", { callbackUrl })}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MicrosoftIcon className="h-5 w-5" />
            Microsoft
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23">
      <path fill="#f35325" d="M1 1h10v10H1z"/>
      <path fill="#81bc06" d="M12 1h10v10H12z"/>
      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
      <path fill="#ffba08" d="M12 12h10v10H12z"/>
    </svg>
  );
}
```

**File: `next.config.mjs`** - Add public env vars:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    NEXT_PUBLIC_HAS_GOOGLE_OAUTH: process.env.GOOGLE_CLIENT_ID ? "true" : "false",
    NEXT_PUBLIC_HAS_MICROSOFT_OAUTH: process.env.AZURE_AD_CLIENT_ID ? "true" : "false",
  },
};

export default nextConfig;
```

### 1.2 Microsoft/Azure AD Provider

**Add to `src/lib/auth-config.ts`:**

```typescript
import AzureADProvider from "next-auth/providers/azure-ad";

// Add to providers array:
...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET ? [
  AzureADProvider({
    clientId: process.env.AZURE_AD_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    allowDangerousEmailAccountLinking: true,
  }),
] : []),
```

### 1.3 Credentials Provider (Email + Password)

**Schema Update - `prisma/schema.prisma`:**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // ADD THIS - null for OAuth users
  role          UserRole  @default(STAFF)  // Changed default from VIEWER
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}
```

**File: `src/lib/auth-config.ts` - Add CredentialsProvider:**

```typescript
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Add to providers array:
CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Email and password required");
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });

    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
}),
```

**File: `src/app/api/auth/register/route.ts`** (NEW):

```typescript
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase, and number",
  }),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: "VIEWER", // Default role for self-registered users
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
```

### 1.4 User Invitation System

**Schema Update - `prisma/schema.prisma`:**

```prisma
model Invitation {
  id        String   @id @default(cuid())
  email     String
  role      UserRole @default(STAFF)
  token     String   @unique
  expiresAt DateTime
  invitedBy String
  inviter   User     @relation(fields: [invitedBy], references: [id])
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@unique([email])
  @@index([token])
  @@index([expiresAt])
}
```

**File: `src/lib/invitations.ts`** (NEW):

```typescript
import "server-only";
import { prisma } from "./prisma";
import { randomBytes } from "crypto";

export async function createInvitation(
  email: string,
  role: "ADMIN" | "STAFF" | "VIEWER",
  invitedBy: string
) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Delete existing invitation for this email
  await prisma.invitation.deleteMany({ where: { email: email.toLowerCase() } });

  return await prisma.invitation.create({
    data: {
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      invitedBy,
    },
  });
}

export async function validateInvitation(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) return null;
  if (invitation.usedAt) return null;
  if (invitation.expiresAt < new Date()) return null;

  return invitation;
}

export async function markInvitationUsed(token: string) {
  await prisma.invitation.update({
    where: { token },
    data: { usedAt: new Date() },
  });
}
```

---

## 📦 Phase 2: Student Management

### 2.1-2.4 Student CRUD

**File: `src/app/admin/students/page.tsx`** (NEW):

```typescript
import { prisma } from "@/lib/prisma";
import { getActiveEvent } from "@/lib/event";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import Link from "next/link";
import StudentTable from "@/components/StudentTable";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const event = await getActiveEvent();
  const categories = await getCategories(event.id);

  const page = parseInt(params.page || "1");
  const pageSize = 50;

  const where = {
    eventId: event.id,
    ...(params.q ? { name: { contains: params.q, mode: "insensitive" as const } } : {}),
    ...(params.category ? { category: params.category } : {}),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.student.count({ where }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-600">{total} students in {event.year}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/students/import"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Import CSV
          </Link>
          <Link
            href="/admin/students/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Student
          </Link>
        </div>
      </div>

      <StudentTable
        students={students}
        categories={categories}
        total={total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
```

**File: `src/app/admin/students/actions.ts`** (NEW):

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getActiveEvent } from "@/lib/event";
import { auditLog } from "@/lib/audit-log";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  size: z.string().min(1).max(50).trim(),
  category: z.string().min(1).max(100).trim(),
});

export async function createStudent(formData: FormData) {
  const session = await requireRole("ADMIN");
  const event = await getActiveEvent();

  const data = studentSchema.parse({
    name: formData.get("name"),
    size: formData.get("size"),
    category: formData.get("category"),
  });

  const student = await prisma.student.create({
    data: {
      ...data,
      eventId: event.id,
    },
  });

  await auditLog({
    userId: session.user.id,
    action: "STUDENT_CREATED",
    resourceType: "Student",
    resourceId: String(student.id),
    details: data,
  });

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(id: number, formData: FormData) {
  const session = await requireRole("ADMIN");
  const event = await getActiveEvent();

  // Verify student belongs to active event
  const existing = await prisma.student.findFirst({
    where: { id, eventId: event.id },
  });

  if (!existing) {
    throw new Error("Student not found");
  }

  const data = studentSchema.parse({
    name: formData.get("name"),
    size: formData.get("size"),
    category: formData.get("category"),
  });

  await prisma.student.update({
    where: { id },
    data,
  });

  await auditLog({
    userId: session.user.id,
    action: "STUDENT_UPDATED",
    resourceType: "Student",
    resourceId: String(id),
    details: { old: existing, new: data },
  });

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function deleteStudent(id: number) {
  const session = await requireRole("ADMIN");
  const event = await getActiveEvent();

  const student = await prisma.student.findFirst({
    where: { id, eventId: event.id },
    select: { id: true, name: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  await prisma.student.delete({ where: { id } });

  await auditLog({
    userId: session.user.id,
    action: "STUDENT_DELETED",
    resourceType: "Student",
    resourceId: String(id),
    details: { name: student.name },
  });

  revalidatePath("/admin/students");
}
```

### 2.5 CSV Import

**File: `src/lib/csv-import.ts`** (NEW):

```typescript
import "server-only";
import { z } from "zod";

export interface CsvRow {
  name: string;
  size: string;
  category: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

const rowSchema = z.object({
  name: z.string().min(1).max(200),
  size: z.string().min(1).max(50),
  category: z.string().min(1).max(100),
});

export function parseCSV(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h === "name");
  const sizeIdx = headers.findIndex((h) => h === "size");
  const categoryIdx = headers.findIndex((h) => h === "category" || h === "group");

  if (nameIdx === -1) throw new Error("Missing 'name' column");
  if (sizeIdx === -1) throw new Error("Missing 'size' column");
  if (categoryIdx === -1) throw new Error("Missing 'category' column");

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return {
      name: values[nameIdx]?.trim() || "",
      size: values[sizeIdx]?.trim() || "",
      category: values[categoryIdx]?.trim() || "",
    };
  });
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

export function validateRow(row: CsvRow, rowNum: number): string | null {
  const result = rowSchema.safeParse(row);
  if (!result.success) {
    return `Row ${rowNum}: ${result.error.errors[0].message}`;
  }
  return null;
}
```

---

## 📦 Phase 3: Infrastructure

### 3.1 Redis Client

**File: `src/lib/redis.ts`** (NEW):

```typescript
import "server-only";
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis };

function createRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set, using in-memory fallback");
    return null;
  }

  try {
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production" && redis) {
  globalForRedis.redis = redis;
}

// Helper for graceful degradation
export async function withRedis<T>(
  redisOperation: (client: Redis) => Promise<T>,
  fallback: () => T
): Promise<T> {
  if (!redis) return fallback();
  try {
    return await redisOperation(redis);
  } catch (error) {
    console.error("Redis operation failed, using fallback:", error);
    return fallback();
  }
}
```

### 3.2 Persistent Audit Log

**Schema Update - `prisma/schema.prisma`:**

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  userEmail  String?
  action     String
  resource   String?
  resourceId String?
  details    Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([resource, resourceId])
  @@index([createdAt])
}
```

**Updated `src/lib/audit-log.ts`:**

```typescript
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

export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Get user email for easier querying
    let userEmail: string | null = null;
    if (entry.userId) {
      const user = await prisma.user.findUnique({
        where: { id: entry.userId },
        select: { email: true },
      });
      userEmail = user?.email || null;
    }

    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        userEmail,
        action: entry.action,
        resource: entry.resourceType,
        resourceId: entry.resourceId,
        details: entry.details as any,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[AUDIT]", {
        timestamp: new Date().toISOString(),
        ...entry,
      });
    }
  } catch (error) {
    // Don't throw - audit logging failures shouldn't break the app
    console.error("Failed to write audit log:", error);
  }
}
```

### 3.3 Structured Logging

**File: `src/lib/logger.ts`** (NEW):

```typescript
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    env: process.env.NODE_ENV,
  },
});

// Request-scoped logger
export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}
```

---

## 📦 Phase 4: CI/CD

### 4.1 GitHub Actions CI

**File: `.github/workflows/ci.yml`** (NEW):

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

  build:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

  docker:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: vbs-app:test
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 4.2 Docker Publish

**File: `.github/workflows/docker-publish.yml`** (NEW):

```yaml
name: Docker Publish

on:
  push:
    tags:
      - "v*"

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 4.4 Update Script

**File: `scripts/update.sh`** (NEW):

```bash
#!/bin/bash
set -e

echo "╔══════════════════════════════════════╗"
echo "║     VBS App Update Script            ║"
echo "╚══════════════════════════════════════╝"

# Check if docker-compose is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Backup database
echo ""
echo "📦 Step 1: Backing up database..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker compose exec -T db pg_dump -U postgres vbsdb > "$BACKUP_FILE"
echo "   ✅ Backup saved to $BACKUP_FILE"

# Pull latest images
echo ""
echo "📥 Step 2: Pulling latest version..."
docker compose pull

# Stop and restart with new images
echo ""
echo "🔄 Step 3: Restarting services..."
docker compose up -d

# Wait for app to be healthy
echo ""
echo "⏳ Step 4: Waiting for app to start..."
sleep 10

# Run migrations
echo ""
echo "📊 Step 5: Running database migrations..."
docker compose exec -T app npx prisma migrate deploy

# Health check
echo ""
echo "🔍 Step 6: Verifying health..."
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "   ✅ App is healthy!"
else
    echo "   ⚠️  Health check failed - check logs with: docker compose logs app"
fi

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     ✅ Update Complete!              ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "If something went wrong, restore with:"
echo "  cat $BACKUP_FILE | docker compose exec -T db psql -U postgres vbsdb"
```

---

## 🎨 Component Patterns

### Toast Notifications

**File: `src/components/Toaster.tsx`** (NEW):

```typescript
"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          borderRadius: "8px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
```

### Loading Spinner

**File: `src/components/Spinner.tsx`** (NEW):

```typescript
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin text-blue-600 ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
```

---

## 📋 Migration Checklist

When implementing each phase:

1. [ ] Create branch: `git checkout -b feature/phase-X-name`
2. [ ] Implement all files listed
3. [ ] Run `npm run lint` - fix errors
4. [ ] Run `npx tsc --noEmit` - fix type errors
5. [ ] Test manually in browser
6. [ ] Update `PRODUCTION_ROADMAP.md` progress
7. [ ] Commit with conventional commit message
8. [ ] Create PR with phase summary

---

*Document created: 2024-12-14*

