import { NextResponse } from "next/server";
import { isAccountLocked, getLockoutRemaining } from "@/lib/auth-lockout";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const locked = await isAccountLocked(email);
  const remaining = locked ? await getLockoutRemaining(email) : null;

  return NextResponse.json({
    locked,
    remaining,
  });
}
