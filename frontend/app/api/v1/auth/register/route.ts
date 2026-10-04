import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIE_NAME, createUserSession, toPublicUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { enforceRateLimit } from "@/server/security/rate-limit";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128).regex(/[A-Z]/, "Password must contain an uppercase letter.").regex(/[0-9]/, "Password must contain a number."),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const limit = enforceRateLimit(request, "register", 5, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ message: "Too many registration attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid registration details." }, { status: 400 });

  const { name, email, password, rememberMe } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { userEmail: email }, select: { userId: true } });
  if (existing) return NextResponse.json({ message: "An account already exists for this email." }, { status: 409 });

  const now = new Date();
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { userId: randomUUID(), userName: name, userEmail: email, passwordHash: await bcrypt.hash(password, 12), updatedAt: now },
    });
    await tx.profile.create({ data: { profileId: randomUUID(), userId: created.userId, updatedAt: now } });
    return created;
  });

  const session = await createUserSession(user, rememberMe, request);
  const response = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  response.cookies.set(AUTH_COOKIE_NAME, session.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: session.maxAge, expires: session.expiryDate });
  return response;
}
