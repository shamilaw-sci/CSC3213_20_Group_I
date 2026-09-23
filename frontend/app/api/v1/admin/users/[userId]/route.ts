import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";
type Context = { params: Promise<{ userId: string }> };
const statusSchema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) }).strict();

async function changeUser(request: Request, context: Context, deleting: boolean) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const origin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }
  const { userId } = await context.params;
  if (!z.string().uuid().safeParse(userId).success) {
    return NextResponse.json({ message: "Invalid user ID." }, { status: 400 });
  }
  if (userId === access.user.id) {
    return NextResponse.json({ message: "You cannot change your own account here." }, { status: 403 });
  }
  let status: "ACTIVE" | "SUSPENDED" | "DELETED" = "DELETED";
  if (!deleting) {
    const parsed = statusSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ message: "Choose ACTIVE or SUSPENDED status." }, { status: 400 });
    }
    status = parsed.data.status;
  }

  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { userId },
      select: { role: true, status: true, deletedAt: true, updatedAt: true },
    });
    if (!target || target.deletedAt || target.status === "DELETED") return "missing" as const;
    // Admin accounts are managed separately so this API cannot remove the last admin.
    if (target.role === "ADMIN") return "protected" as const;

    const now = new Date();
    const changed = await tx.user.updateMany({
      where: { userId, role: target.role, status: target.status, deletedAt: null, updatedAt: target.updatedAt },
      data: { status, deletedAt: deleting ? now : null, updatedAt: now },
    });
    if (changed.count !== 1) return "conflict" as const;

    if (status !== "ACTIVE") {
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now, updatedAt: now },
      });
      await tx.passwordresettoken.updateMany({
        where: { userId, usedAt: null }, data: { usedAt: now },
      });
    }
    await tx.auditlog.create({
      data: {
        auditLogId: randomUUID(), adminId: access.user.id,
        action: deleting ? "USER_DELETED" : status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED",
        entityType: "user", entityId: userId,
        metadata: { previousStatus: target.status, status },
      },
    });
    return "ok" as const;
  });

  if (result === "missing") return NextResponse.json({ message: "User not found." }, { status: 404 });
  if (result === "protected") return NextResponse.json({ message: "Admin accounts cannot be changed here." }, { status: 403 });
  if (result === "conflict") return NextResponse.json({ message: "This account changed. Reload and try again." }, { status: 409 });
  return NextResponse.json({ success: true, user: { id: userId, status } });
}

export async function PATCH(request: Request, context: Context) {
  return changeUser(request, context, false);
}

export async function DELETE(request: Request, context: Context) {
  return changeUser(request, context, true);
}
