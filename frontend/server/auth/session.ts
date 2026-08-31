import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { prisma } from "@/server/db/prisma";

export const AUTH_COOKIE_NAME = "tryvora_session";

type SessionUser = {
  userId: string;
  userName: string;
  userEmail: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
};

type SessionClaims = {
  sub: string;
  sid: string;
  role: SessionUser["role"];
};

function jwtSecret() {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must be set to a secure value of at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

function durationToSeconds(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const match = /^(\d+)\s*([smhd])$/i.exec(value.trim());
  if (!match) return fallback;
  const amount = Number(match[1]);
  const multiplier = { s: 1, m: 60, h: 60 * 60, d: 60 * 60 * 24 }[match[2].toLowerCase() as "s" | "m" | "h" | "d"];
  return amount * multiplier;
}

export function cookieMaxAge(persistent: boolean) {
  return persistent
    ? durationToSeconds(process.env.JWT_REFRESH_EXPIRES_IN, 60 * 60 * 24 * 30)
    : durationToSeconds(process.env.JWT_TEMPORARY_EXPIRES_IN, 60 * 60 * 8);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function toPublicUser(user: SessionUser) {
  return { id: user.userId, name: user.userName, email: user.userEmail, role: user.role };
}

export async function createUserSession(user: SessionUser, persistent: boolean) {
  const sessionId = randomUUID();
  const maxAge = cookieMaxAge(persistent);
  const expiryDate = new Date(Date.now() + maxAge * 1000);
  const token = await new SignJWT({ sid: sessionId, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(expiryDate)
    .sign(jwtSecret());

  const now = new Date();
  await prisma.session.create({
    data: {
      sessionId,
      userId: user.userId,
      tokenHash: tokenHash(token),
      type: persistent ? "PERSISTENT" : "TEMPORARY",
      expiryDate,
      updatedAt: now,
    },
  });

  return { token, expiryDate, maxAge };
}

export async function getCurrentSession() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const claims = payload as Partial<SessionClaims>;
    if (!claims.sub || !claims.sid) return null;

    const session = await prisma.session.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { user: true },
    });

    if (
      !session ||
      session.sessionId !== claims.sid ||
      session.userId !== claims.sub ||
      session.revokedAt ||
      session.expiryDate <= new Date() ||
      session.user.status !== "ACTIVE" ||
      session.user.deletedAt
    ) {
      return null;
    }

    return { session, user: toPublicUser(session.user) };
  } catch {
    return null;
  }
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: tokenHash(token), revokedAt: null },
    data: { revokedAt: new Date(), updatedAt: new Date() },
  });
}
