import { randomUUID } from "node:crypto";

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  department: z.string().trim().max(100),
  designation: z.string().trim().min(2).max(100),
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128)
    .regex(/[A-Z]/, "New password must contain an uppercase letter.")
    .regex(/[0-9]/, "New password must contain a number.").optional(),
}).strict();

function publicAccount(user: {
  userName: string;
  userEmail: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  createdAt: Date;
  lastLoginAt: Date | null;
  adminprofile: { department: string | null; designation: string; avatarData: Uint8Array | null } | null;
}) {
  return {
    name: user.userName,
    email: user.userEmail,
    role: user.role,
    department: user.adminprofile?.department ?? "",
    designation: user.adminprofile?.designation ?? "Administrator",
    hasAvatar: Boolean(user.adminprofile?.avatarData),
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const user = await prisma.user.findUnique({
    where: { userId: access.user.id },
    include: { adminprofile: true },
  });
  if (!user) return NextResponse.json({ message: "Admin account not found." }, { status: 404 });
  return NextResponse.json({ account: publicAccount(user) });
}

export async function PATCH(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid account details." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({
    where: { userId: access.user.id },
    include: { adminprofile: true },
  });
  if (!existing) return NextResponse.json({ message: "Admin account not found." }, { status: 404 });
  if (!(await bcrypt.compare(parsed.data.currentPassword, existing.passwordHash))) {
    return NextResponse.json({ message: "Current password is incorrect." }, { status: 401 });
  }

  const now = new Date();
  const passwordChanged = Boolean(parsed.data.newPassword);
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { userId: existing.userId },
        data: {
          userName: parsed.data.name,
          userEmail: parsed.data.email,
          passwordHash: parsed.data.newPassword ? await bcrypt.hash(parsed.data.newPassword, 12) : existing.passwordHash,
          updatedAt: now,
        },
      });
      const adminprofile = await tx.adminprofile.upsert({
        where: { userId: existing.userId },
        create: { adminProfileId: randomUUID(), userId: existing.userId, department: parsed.data.department || null, designation: parsed.data.designation, updatedAt: now },
        update: { department: parsed.data.department || null, designation: parsed.data.designation, updatedAt: now },
      });
      if (passwordChanged) {
        await tx.session.updateMany({
          where: { userId: existing.userId, sessionId: { not: access.session.sessionId }, revokedAt: null },
          data: { revokedAt: now, updatedAt: now },
        });
      }
      await tx.auditlog.create({
        data: {
          auditLogId: randomUUID(), adminId: existing.userId,
          action: passwordChanged ? "ADMIN_ACCOUNT_AND_PASSWORD_UPDATED" : "ADMIN_ACCOUNT_UPDATED",
          entityType: "user", entityId: existing.userId,
          metadata: { emailChanged: parsed.data.email !== existing.userEmail, passwordChanged },
        },
      });
      return { ...user, adminprofile };
    });
    return NextResponse.json({ account: publicAccount(updated), passwordChanged });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ message: "That email address is already in use." }, { status: 409 });
    }
    throw error;
  }
}
