import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

export async function DELETE(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const { sessionId } = await context.params;
  if (sessionId === access.session.sessionId) return NextResponse.json({ message: "Use Sign out to end your current session." }, { status: 400 });

  const session = await prisma.session.findUnique({ where: { sessionId }, select: { sessionId: true, userId: true, revokedAt: true, expiryDate: true } });
  if (!session) return NextResponse.json({ message: "Session not found." }, { status: 404 });
  if (session.revokedAt || session.expiryDate <= new Date()) return NextResponse.json({ message: "This session is no longer active." }, { status: 409 });

  const now = new Date();
  await prisma.$transaction([
    prisma.session.update({ where: { sessionId }, data: { revokedAt: now, updatedAt: now } }),
    prisma.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: "ADMIN_SESSION_REVOKED", entityType: "session", entityId: sessionId, metadata: { affectedUserId: session.userId } } }),
  ]);
  return NextResponse.json({ message: "Session revoked." });
}
