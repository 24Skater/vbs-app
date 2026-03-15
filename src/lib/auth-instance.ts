/**
 * NextAuth instance - exports both handlers and auth function
 */
import "server-only";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const { handlers, auth } = NextAuth(authOptions);

