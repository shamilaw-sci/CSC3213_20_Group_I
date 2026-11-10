import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const updateSchema = z.object({ status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"]), resolutionNotes: z.string().trim().max(10000).nullable().optional() });

export async function GET() {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const tickets = await prisma.feedback.findMany({ where: { userId: { not: null } }, orderBy: { createdAt: "desc" }, take: 200, include: { user_feedback_userIdTouser: { select: { userId: true, userName: true, userEmail: true } } } });
  return NextResponse.json({ tickets: tickets.map((ticket) => ({ id: ticket.feedbackId, reference: `TV-${ticket.feedbackId.slice(0, 8).toUpperCase()}`, subject: ticket.subject, status: ticket.status, message: ticket.message, response: ticket.resolutionNotes, createdAt: ticket.createdAt, customer: ticket.user_feedback_userIdTouser })) });
}

export async function PATCH(request: Request) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const body = await request.json().catch(() => null) as { ticketId?: string } & Record<string, unknown> | null;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success || !body?.ticketId) return NextResponse.json({ message: "Invalid support ticket update." }, { status: 400 });
  const ticket = await prisma.feedback.update({ where: { feedbackId: body.ticketId }, data: { status: parsed.data.status, resolutionNotes: parsed.data.resolutionNotes ?? null, resolvedById: parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED" ? access.user.id : null, resolvedAt: parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED" ? new Date() : null, updatedAt: new Date() } }).catch(() => null);
  if (!ticket) return NextResponse.json({ message: "Support ticket not found." }, { status: 404 });
  return NextResponse.json({ ticket: { id: ticket.feedbackId, status: ticket.status, response: ticket.resolutionNotes } });
}
