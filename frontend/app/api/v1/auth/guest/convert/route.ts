import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { convertGuestSession, GUEST_COOKIE_NAME } from "@/server/auth/guest";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;
  const limit = enforceRateLimit(request, "guest-convert", 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ message: "Too many conversion requests." }, {
      status: 429, headers: { "Retry-After": String(limit.retryAfter) },
    });
  }
  // Never accept the destination account ID from the request body.
  const converted = await convertGuestSession(access.user.id);
  const response = NextResponse.json({ converted });
  response.cookies.set(GUEST_COOKIE_NAME, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 0,
  });
  return response;
}
