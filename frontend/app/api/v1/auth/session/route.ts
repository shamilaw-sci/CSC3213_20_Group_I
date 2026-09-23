import { NextResponse } from "next/server";

import { getCurrentSession } from "@/server/auth/session";

export async function GET() {
  const current = await getCurrentSession();
  if (!current) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: current.user });
}
