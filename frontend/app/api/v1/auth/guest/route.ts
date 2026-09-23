import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { GUEST_COOKIE_NAME, GUEST_MAX_AGE, getCurrentGuestSession, hashGuestToken } from "@/server/auth/guest";
import { getCurrentSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }
  const limit = enforceRateLimit(request, "guest-create", 30, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ message: "Too many guest requests." }, {
      status: 429, headers: { "Retry-After": String(limit.retryAfter) },
    });
  }
  if (await getCurrentSession()) {
    return NextResponse.json({ message: "You are already signed in." }, { status: 409 });
  }
  const existing = await getCurrentGuestSession();
  if (existing) {
    return NextResponse.json({ guest: { id: existing.guestSessionId, expiresAt: existing.expiryDate } });
  }

  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiryDate = new Date(now.getTime() + GUEST_MAX_AGE * 1000);
  const guest = await prisma.guestsession.create({
    data: {
      guestSessionId: randomUUID(), tokenHash: hashGuestToken(token),
      expiryDate, lastUsedAt: now, updatedAt: now,
    },
  });
  const response = NextResponse.json({ guest: { id: guest.guestSessionId, expiresAt: expiryDate } }, { status: 201 });
  response.cookies.set(GUEST_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: GUEST_MAX_AGE, expires: expiryDate,
  });
  return response;
}
