import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const updateSchema = z.object({
  merchantId: z.string().trim().min(1),
  categoryName: z.string().trim().min(2).max(100),
  productName: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.number().positive().max(9999999999),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  merchantUrl: z.string().trim().url().max(2048),
  primaryImageUrl: z.union([z.string().trim().url().max(2048), z.literal("")]).optional().default(""),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
}).strict();

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";
}

export async function PATCH(request: Request, context: { params: Promise<{ productId: string }> }) {
  const access = await requireAuthenticatedUser(["ADMIN"]);
  if ("error" in access) return access.error;
  const allowedOrigin = process.env.APP_ORIGIN ?? new URL(request.url).origin;
  if (request.headers.get("origin") !== allowedOrigin) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter valid product details, price, URLs, and currency." }, { status: 400 });
  const { productId } = await context.params;

  const [product, merchant, category] = await Promise.all([
    prisma.product.findUnique({ where: { productId }, select: { productId: true } }),
    prisma.merchant.findUnique({ where: { merchantId: parsed.data.merchantId }, select: { merchantId: true, status: true } }),
    prisma.category.findUnique({ where: { name: parsed.data.categoryName }, select: { categoryId: true } }),
  ]);
  if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });
  if (!merchant) return NextResponse.json({ message: "Merchant not found." }, { status: 404 });
  if (parsed.data.status === "ACTIVE" && merchant.status !== "ACTIVE") return NextResponse.json({ message: "Only products from active merchants can be published." }, { status: 400 });
  const categoryId = category?.categoryId ?? randomUUID();
  if (!category) await prisma.category.create({ data: { categoryId, name: parsed.data.categoryName, slug: `${slugify(parsed.data.categoryName)}-${categoryId.slice(0, 6)}`, updatedAt: new Date() } });

  await prisma.$transaction([
    prisma.product.update({ where: { productId }, data: { merchantId: parsed.data.merchantId, categoryId, productName: parsed.data.productName, description: parsed.data.description || null, price: parsed.data.price, currency: parsed.data.currency, primaryImageUrl: parsed.data.primaryImageUrl || null, merchantUrl: parsed.data.merchantUrl, status: parsed.data.status, updatedAt: new Date() } }),
    prisma.auditlog.create({ data: { auditLogId: randomUUID(), adminId: access.user.id, action: "PRODUCT_UPDATED", entityType: "product", entityId: productId, metadata: { productName: parsed.data.productName, status: parsed.data.status } } }),
  ]);
  return NextResponse.json({ id: productId });
}
