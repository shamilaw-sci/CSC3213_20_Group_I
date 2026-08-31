import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, revokeCurrentSession } from "@/server/auth/session";

export async function POST() {
  await revokeCurrentSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
