import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Simple health check - verify database connection
    // Don't expose database details in error messages
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    // Generic error message - don't expose database connection details
    return NextResponse.json(
      { status: "error" },
      { status: 503 }
    );
  }
}
