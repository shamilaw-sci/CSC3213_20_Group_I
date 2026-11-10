import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const createSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  category: z.enum(["ACCOUNT", "DIGITAL_TWIN", "TRY_ON", "PRODUCTS", "PLANS", "PRIVACY", "OTHER"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  message: z.string().trim().min(10).max(10000),
});

const typeMap = { ACCOUNT: "GENERAL", DIGITAL_TWIN: "DIGITAL_TWIN", TRY_ON: "VIRTUAL_TRY_ON", PRODUCTS: "PRODUCT", PLANS: "GENERAL", PRIVACY: "GENERAL", OTHER: "GENERAL" } as const;

export async function GET() {
  const access = await requireAuthenticatedUser(["CUSTOMER"]);
  if ("error" in access) return access.error;
  const tickets = await prisma.feedback.findMany({ where: { userId: access.user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ tickets: tickets.map((ticket) => ({ id: ticket.feedbackId, reference: `TV-${ticket.feedbackId.slice(0, 8).toUpperCase()}`, subject: ticket.subject, category: ticket.type, priority: ticket.rating, message: ticket.message, response: ticket.resolutionNotes, status: ticket.status, createdAt: ticket.createdAt, updatedAt: ticket.updatedAt })) });
}

export async function POST(request: Request) {
  const access = await requireAuthenticatedUser(["CUSTOMER"]);
  if ("error" in access) return access.error;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Please complete the support form." }, { status: 400 });
  const ticket = await prisma.feedback.create({ data: { feedbackId: randomUUID(), userId: access.user.id, type: typeMap[parsed.data.category], status: "OPEN", rating: parsed.data.priority === "HIGH" ? 3 : parsed.data.priority === "LOW" ? 1 : 2, subject: parsed.data.subject, message: `[Priority: ${parsed.data.priority}] ${parsed.data.message}`, updatedAt: new Date() } });
  return NextResponse.json({ ticket: { id: ticket.feedbackId, reference: `TV-${ticket.feedbackId.slice(0, 8).toUpperCase()}`, status: ticket.status, createdAt: ticket.createdAt } }, { status: 201 });
}
