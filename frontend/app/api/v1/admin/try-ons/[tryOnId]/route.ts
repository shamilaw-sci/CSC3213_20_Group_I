import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const schema = z.object({ action: z.enum(["RETRY", "CANCEL"]) }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ tryOnId: string }> }) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Choose a valid try-on action." }, { status: 400 });
  const { tryOnId } = await context.params;
  const session = await prisma.tryonsession.findUnique({ where: { tryOnSessionId: tryOnId } });
  if (!session) return NextResponse.json({ message: "Try-on session not found." }, { status: 404 });
  const retrying = parsed.data.action === "RETRY";
  if (retrying && !["FAILED", "CANCELLED"].includes(session.status)) return NextResponse.json({ message: "Only failed or cancelled try-ons can be retried." }, { status: 409 });
  if (!retrying && !["PENDING", "PROCESSING"].includes(session.status)) return NextResponse.json({ message: "Only pending or processing try-ons can be cancelled." }, { status: 409 });
  const now = new Date();
  const status = retrying ? "PENDING" : "CANCELLED";
  await prisma.$transaction([
    prisma.tryonsession.update({ where: { tryOnSessionId: tryOnId }, data: retrying ? { status, errorMessage: null, startedAt: null, completedAt: null, updatedAt: now } : { status, completedAt: now, updatedAt: now } }),
    prisma.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: retrying ? "TRY_ON_RETRIED" : "TRY_ON_CANCELLED", entityType: "tryOnSession", entityId: tryOnId } }),
  ]);
  return NextResponse.json({ status });
}
