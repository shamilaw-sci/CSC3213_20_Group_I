import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const planSchema = z.object({ plan: z.enum(["STARTER", "STYLE_PLUS", "STYLE_PRO"]) });

export async function GET() {
  const access = await requireAuthenticatedUser(["CUSTOMER"]);
  if ("error" in access) return access.error;
  try {
    const subscription = await prisma.customer_subscription.upsert({ where: { userId: access.user.id }, create: { subscriptionId: randomUUID(), userId: access.user.id, plan: "STARTER", status: "DEMO_ACTIVE", updatedAt: new Date() }, update: {} });
    return NextResponse.json({ subscription: { id: subscription.subscriptionId, plan: subscription.plan, status: subscription.status, startedAt: subscription.startedAt, updatedAt: subscription.updatedAt } });
  } catch (error) {
    console.error("Customer subscription GET failed", error);
    return NextResponse.json({ message: "Customer subscription storage is not available. Apply the customer subscription migration before using My Plan." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAuthenticatedUser(["CUSTOMER"]);
  if ("error" in access) return access.error;
  const parsed = planSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Select a valid customer plan." }, { status: 400 });
  try {
    const subscription = await prisma.customer_subscription.upsert({ where: { userId: access.user.id }, create: { subscriptionId: randomUUID(), userId: access.user.id, plan: parsed.data.plan, status: "DEMO_ACTIVE", updatedAt: new Date() }, update: { plan: parsed.data.plan, status: "DEMO_ACTIVE", updatedAt: new Date() } });
    return NextResponse.json({ subscription: { id: subscription.subscriptionId, plan: subscription.plan, status: subscription.status, startedAt: subscription.startedAt, updatedAt: subscription.updatedAt }, message: "Plan updated for this demonstration account. No payment was collected." });
  } catch (error) {
    console.error("Customer subscription PATCH failed", error);
    return NextResponse.json({ message: "Customer subscription storage is not available. Apply the customer subscription migration before changing plans." }, { status: 503 });
  }
}
