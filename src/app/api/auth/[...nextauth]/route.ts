/**
 * NextAuth configuration
 */
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { UserRole, SESSION_MAX_AGE_SEC, SESSION_UPDATE_AGE_SEC } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: process.env.EMAIL_SERVER_SECURE === "true",
      },
      from: process.env.EMAIL_FROM || "noreply@example.com",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, email }) {
      const { isAccountLocked, getLockoutRemaining, recordLoginAttempt } = await import("@/lib/auth-lockout");

      // Check if account is locked (for email verification requests)
      if (email?.verificationRequest && user.email) {
        if (isAccountLocked(user.email)) {
          const remaining = getLockoutRemaining(user.email);
          recordLoginAttempt(user.email, false);
          throw new Error(
            `Account locked due to too many failed attempts. Please try again in ${Math.ceil((remaining || 0) / 60)} minutes.`
          );
        }
      }

      // Record successful login attempt
      if (user.email) {
        // Check if this is a successful verification (user is signing in)
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { emailVerified: true },
        });

        // If user exists and is verified, this is a successful login
        if (dbUser?.emailVerified) {
          recordLoginAttempt(user.email, true);
        }

        // Require email verification for new users
        // Allow first-time sign-in to create account, but require verification for subsequent logins
        if (dbUser && !dbUser.emailVerified) {
          // In production, you might want to be stricter and require verification
          // For now, we'll allow it but log it
          // TODO: Replace with proper logging service in production
          if (process.env.NODE_ENV === "development") {
            console.warn(`Unverified user attempting to sign in: ${user.email}`);
          }
        }
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        // Get user role from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { role: true, id: true, emailVerified: true },
        });

        session.user.id = user.id;
        session.user.role = (dbUser?.role as UserRole) || "VIEWER";
        // Note: emailVerified is available but not exposed in session for now
      }
      return session;
    },
  },
  session: {
    strategy: "database",
    maxAge: SESSION_MAX_AGE_SEC, // 30 days
    updateAge: SESSION_UPDATE_AGE_SEC, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
