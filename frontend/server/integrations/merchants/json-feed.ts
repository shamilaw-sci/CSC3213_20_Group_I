import { randomUUID } from "node:crypto";
import { z } from "zod";

import type { merchantModel } from "@/app/generated/prisma/models";
import { prisma } from "@/server/db/prisma";

const feedProductSchema = z.object({
  externalId: z.string().trim().min(1).max(255),
  categorySlug: z.string().trim().min(1).max(120),
  productName: z.string().trim().min(2).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default("USD"),
  primaryImageUrl: z.string().url().max(2048).nullable().optional(),
  merchantUrl: z.string().url().max(2048),
  variants: z.array(z.object({
    sku: z.string().trim().min(1).max(100),
    size: z.string().trim().max(50).nullable().optional(),
    color: z.string().trim().max(100).nullable().optional(),
    price: z.number().nonnegative().nullable().optional(),
    stockQuantity: z.number().int().min(0).max(100000).default(0),
  })).max(100).default([]),
});

const feedSchema = z.object({
  products: z.array(feedProductSchema).max(500),
});

function assertHttpUrl(url: string) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Merchant feed URL must use HTTP or HTTPS.");
  }
}

export async function syncMerchantJsonFeed(merchant: merchantModel, feedUrl: string) {
  assertHttpUrl(feedUrl);
  const response = await fetch(feedUrl, { cache: "no-store" });
  if (!response.ok) throw new Error("Merchant feed could not be loaded.");

  const parsed = feedSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Merchant feed is invalid.");

  let upserted = 0;
  const now = new Date();

  for (const item of parsed.data.products) {
    const category = await prisma.category.findUnique({ where: { slug: item.categorySlug } });
    if (!category) continue;

    const product = await prisma.product.upsert({
      where: { merchantId_externalId: { merchantId: merchant.merchantId, externalId: item.externalId } },
      create: {
        productId: randomUUID(),
        merchantId: merchant.merchantId,
        categoryId: category.categoryId,
        externalId: item.externalId,
        productName: item.productName,
        description: item.description,
        price: item.price,
        currency: item.currency,
        primaryImageUrl: item.primaryImageUrl,
        merchantUrl: item.merchantUrl,
        status: "DRAFT",
        lastSyncedAt: now,
        updatedAt: now,
      },
      update: {
        categoryId: category.categoryId,
        productName: item.productName,
        description: item.description,
        price: item.price,
        currency: item.currency,
        primaryImageUrl: item.primaryImageUrl,
        merchantUrl: item.merchantUrl,
        lastSyncedAt: now,
        updatedAt: now,
      },
    });

    await prisma.productvariant.deleteMany({ where: { productId: product.productId } });
    if (item.variants.length) {
      await prisma.productvariant.createMany({
        data: item.variants.map((variant) => ({
          productVariantId: randomUUID(),
          productId: product.productId,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          updatedAt: now,
        })),
      });
    }

    upserted += 1;
  }

  return { upserted };
}
