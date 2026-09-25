/** WBS-2.2 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Profile persistence and account deletion API. */
import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession, toPublicUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { removeEncryptedTwin } from "@/server/storage/digital-twin-storage";

export const runtime = "nodejs";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().trim().toLowerCase().email().max(255).optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
});

function accountName(userName: string) {
  const [firstName = "", ...lastName] = userName.trim().split(/\s+/);
  return { firstName, lastName: lastName.join(" ") };
}

function formatProfile(user: { userId: string; userName: string; userEmail: string; role: "CUSTOMER" | "MERCHANT" | "ADMIN"; profile: { phone: string | null; country: string | null; dateOfBirth: Date | null } | null }) {
  return {
    user: toPublicUser(user),
    account: {
      ...accountName(user.userName),
      email: user.userEmail,
      phone: user.profile?.phone ?? "",
      country: user.profile?.country ?? "",
      dateOfBirth: user.profile?.dateOfBirth?.toISOString().slice(0, 10) ?? "",
    },
  };
}

export async function GET() {
  const current = await getCurrentSession();
  if (!current) return NextResponse.json({ message: "Authentication is required." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { userId: current.session.userId },
    include: { profile: true },
  });
  if (!user) return NextResponse.json({ message: "User not found." }, { status: 404 });
  return NextResponse.json(formatProfile(user));
}

export async function PATCH(request: Request) {
  const current = await getCurrentSession();
  if (!current) return NextResponse.json({ message: "Authentication is required." }, { status: 401 });
  const parsed = updateProfileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid profile details." }, { status: 400 });

  const input = parsed.data;
  const existing = await prisma.user.findUnique({ where: { userId: current.session.userId }, include: { profile: true } });
  if (!existing) return NextResponse.json({ message: "User not found." }, { status: 404 });

  const names = accountName(existing.userName);
  const firstName = input.firstName ?? names.firstName;
  const lastName = input.lastName ?? names.lastName;
  const userName = [firstName, lastName].filter(Boolean).join(" ");
  const now = new Date();

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const savedUser = await tx.user.update({
        where: { userId: existing.userId },
        data: { userName, userEmail: input.email ?? existing.userEmail, updatedAt: now },
      });
      const savedProfile = await tx.profile.upsert({
        where: { userId: existing.userId },
        create: { profileId: randomUUID(), userId: existing.userId, phone: input.phone ?? null, country: input.country ?? null, dateOfBirth: input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : null, updatedAt: now },
        update: { phone: input.phone ?? existing.profile?.phone ?? null, country: input.country ?? existing.profile?.country ?? null, dateOfBirth: input.dateOfBirth === undefined ? existing.profile?.dateOfBirth ?? null : input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : null, updatedAt: now },
      });
      return { ...savedUser, profile: savedProfile };
    });
    return NextResponse.json(formatProfile(updated));
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return NextResponse.json({ message: "That email address is already in use." }, { status: 409 });
    throw error;
  }
}

export async function DELETE() {
  const current = await getCurrentSession();

  if (!current) {
    return NextResponse.json(
      { message: "Authentication is required." },
      { status: 401 },
    );
  }

  const userId = current.session.userId;
  const now = new Date();

  const twins = await prisma.digitaltwin.findMany({
    where: { userId },
    select: { encryptedImagePath: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { userId },
      data: {
        status: "DELETED",
        deletedAt: now,
        updatedAt: now,
      },
    }),
    prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
        updatedAt: now,
      },
    }),
    prisma.digitaltwin.updateMany({
      where: {
        userId,
        deletedAt: null,
      },
      data: {
        status: "DELETED",
        deletedAt: now,
        updatedAt: now,
      },
    }),
  ]);

  const cleanupResults = await Promise.allSettled(
    twins.map((twin) => removeEncryptedTwin(twin.encryptedImagePath)),
  );

  const cleanupPending = cleanupResults.some(
    (result) => result.status === "rejected",
  );

  const response = NextResponse.json(
    {
      success: true,
      cleanupPending,
    },
    {
      status: cleanupPending ? 202 : 200,
    },
  );

  response.cookies.set("tryvora_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
