import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const updateSchema = z.object({
  storeName: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(191),
  ownerName: z.string().trim().max(150).optional().default(""),
  phone: z.string().trim().max(32).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  businessCategory: z.string().trim().max(100).optional().default(""),
  websiteUrl: z.union([z.string().trim().url().max(2048), z.literal("")]).optional().default(""),
  storeDescription: z.string().trim().max(3000).optional().default(""),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]),
  plan: z.enum(["FREE", "STANDARD", "PRO"]),
}).strict();

export async function PATCH(request: Request, context: { params: Promise<{ merchantId: string }> }) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter valid merchant contact and store details." }, { status: 400 });
  const { merchantId } = await context.params;
  const merchant = await prisma.merchant.findUnique({ where: { merchantId }, select: { merchantId: true, userId: true } });
  if (!merchant) return NextResponse.json({ message: "Merchant not found." }, { status: 404 });
  const duplicate = await prisma.merchant.findFirst({ where: { email: parsed.data.email, merchantId: { not: merchantId } }, select: { merchantId: true } });
  if (duplicate) return NextResponse.json({ message: "A merchant already uses this email address." }, { status: 409 });
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.merchant.update({ where: { merchantId }, data: { storeName: parsed.data.storeName, email: parsed.data.email, ownerName: parsed.data.ownerName || null, phone: parsed.data.phone || null, address: parsed.data.address || null, businessCategory: parsed.data.businessCategory || null, websiteUrl: parsed.data.websiteUrl || null, storeDescription: parsed.data.storeDescription || null, status: parsed.data.status, updatedAt: now } });
    if (merchant.userId) {
      const enabled = parsed.data.status === "ACTIVE";
      await tx.user.update({ where: { userId: merchant.userId }, data: { status: enabled ? "ACTIVE" : "SUSPENDED", updatedAt: now } });
      if (!enabled) await tx.session.updateMany({ where: { userId: merchant.userId, revokedAt: null }, data: { revokedAt: now, updatedAt: now } });
    }
    await tx.subscription.upsert({
      where: { merchantId },
      create: { subscriptionId: randomUUID(), merchantId, plan: parsed.data.plan, status: parsed.data.plan === "FREE" ? "DEMO_ACTIVE" : "ACTIVE", updatedAt: now },
      update: { plan: parsed.data.plan, status: parsed.data.plan === "FREE" ? "DEMO_ACTIVE" : "ACTIVE", updatedAt: now },
    });
    await tx.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: "MERCHANT_UPDATED", entityType: "merchant", entityId: merchantId, metadata: { storeName: parsed.data.storeName, status: parsed.data.status, plan: parsed.data.plan } } });
  });
  return NextResponse.json({ id: merchantId });
}
