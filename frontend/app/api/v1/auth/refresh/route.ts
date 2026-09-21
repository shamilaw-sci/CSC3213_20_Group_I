import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, rotateCurrentSession } from "@/server/auth/session";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // APP_ORIGIN may be set to the public origin when running behind a proxy.
  const expectedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== expectedOrigin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const limit = enforceRateLimit(request, "refresh", 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ message: "Too many refresh requests." }, {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter) },
    });
  }

  const result = await rotateCurrentSession();
  if (result.status === "unauthenticated") {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }
  if (result.status === "conflict") {
    // Another request may have set the new cookie already; do not clear it.
    return NextResponse.json({ message: "Session changed. Retry the request." }, { status: 409 });
  }

  const response = NextResponse.json({ user: result.user, expiresAt: result.expiryDate });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(AUTH_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: result.maxAge,
    expires: result.expiryDate,
  });
  return response;
}
