import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const schema = z.object({ status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"]), resolutionNotes: z.string().trim().max(2000).optional().default("") }).strict();

export async function PATCH(request: Request, context: { params: Promise<{ feedbackId: string }> }) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid feedback update." }, { status: 400 });
  const { feedbackId } = await context.params;
  const existing = await prisma.feedback.findUnique({ where: { feedbackId }, select: { feedbackId: true } });
  if (!existing) return NextResponse.json({ message: "Feedback not found." }, { status: 404 });
  const resolved = parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED";
  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const item = await tx.feedback.update({ where: { feedbackId }, data: { status: parsed.data.status, resolutionNotes: parsed.data.resolutionNotes || null, resolvedById: resolved ? access.user.id : null, resolvedAt: resolved ? now : null, updatedAt: now } });
    await tx.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: "FEEDBACK_STATUS_UPDATED", entityType: "feedback", entityId: feedbackId, metadata: { status: parsed.data.status } } });
    return item;
  });
  return NextResponse.json({ feedback: { id: updated.feedbackId, status: updated.status, resolutionNotes: updated.resolutionNotes, resolvedAt: updated.resolvedAt } });
}
