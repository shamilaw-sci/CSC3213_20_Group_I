import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const updateSchema = z.object({
  kind: z.enum(["REGISTERED", "GUEST"]),
  status: z.enum(["ACTIVE", "RESTRICTED"]),
}).strict();

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Choose a valid customer status." }, { status: 400 });
  const { userId } = await context.params;
  const restricted = parsed.data.status === "RESTRICTED";
  const now = new Date();

  if (parsed.data.kind === "REGISTERED") {
    const customer = await prisma.user.findUnique({ where: { userId }, select: { userId: true, role: true, status: true } });
    if (!customer) return NextResponse.json({ message: "Registered user not found." }, { status: 404 });
    if (customer.role !== "CUSTOMER") return NextResponse.json({ message: "Only customer accounts can be restricted here." }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { userId }, data: { status: restricted ? "SUSPENDED" : "ACTIVE", updatedAt: now } });
      if (restricted) await tx.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now, updatedAt: now } });
      await tx.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: restricted ? "CUSTOMER_RESTRICTED" : "CUSTOMER_REACTIVATED", entityType: "user", entityId: userId } });
    });
  } else {
    const guest = await prisma.guestsession.findUnique({ where: { guestSessionId: userId }, select: { guestSessionId: true } });
    if (!guest) return NextResponse.json({ message: "Guest user not found." }, { status: 404 });
    await prisma.$transaction([
      prisma.guestsession.update({ where: { guestSessionId: userId }, data: { restrictedAt: restricted ? now : null, updatedAt: now } }),
      prisma.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: restricted ? "GUEST_RESTRICTED" : "GUEST_REACTIVATED", entityType: "guestSession", entityId: userId } }),
    ]);
  }

  return NextResponse.json({ status: parsed.data.status });
}
