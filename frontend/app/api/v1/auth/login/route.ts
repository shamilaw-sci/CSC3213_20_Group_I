import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIE_NAME, createUserSession, toPublicUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const limit = enforceRateLimit(request, "login", 10, 15 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "Too many sign-in attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter a valid email and password." }, { status: 400 });

  const { email, password, rememberMe } = parsed.data;
  const user = await prisma.user.findUnique({ where: { userEmail: email } });
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches || user.status !== "ACTIVE" || user.deletedAt) {
    return NextResponse.json({ message: "Incorrect email or password." }, { status: 401 });
  }

  await prisma.user.update({ where: { userId: user.userId }, data: { lastLoginAt: new Date(), updatedAt: new Date() } });
  const session = await createUserSession(user, rememberMe);
  const response = NextResponse.json({ user: toPublicUser(user) });
  response.cookies.set(AUTH_COOKIE_NAME, session.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: session.maxAge, expires: session.expiryDate });
  return response;
}
