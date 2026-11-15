import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

const updateSchema = z.object({
  name: z.string().trim().max(150).nullable().optional(),
  productIds: z.array(z.string().uuid()).min(1).max(4).optional(),
}).refine((value) => value.name !== undefined || value.productIds !== undefined);

type DecimalLike = { toString: () => string };
type ComparisonDetailsRow = {
  comparisonId: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparisonitem: {
    comparisonItemId: string;
    product: {
      productId: string;
      productName: string;
      description: string | null;
      price: DecimalLike;
      currency: string;
      primaryImageUrl: string | null;
      merchantUrl: string;
      merchant: { storeName: string };
      category: { name: string; slug: string };
      productvariant: {
        productVariantId: string;
        size: string | null;
        color: string | null;
        price: DecimalLike | null;
        stockQuantity: number | null;
      }[];
    };
  }[];
};

function comparisonDetailsDto(comparison: ComparisonDetailsRow) {
  return {
    id: comparison.comparisonId,
    name: comparison.name,
    createdAt: comparison.createdAt,
    updatedAt: comparison.updatedAt,
    products: comparison.comparisonitem.map((item) => ({
      id: item.product.productId,
      name: item.product.productName,
      description: item.product.description,
      price: Number(item.product.price),
      currency: item.product.currency,
      image: item.product.primaryImageUrl,
      merchantUrl: item.product.merchantUrl,
      merchant: item.product.merchant.storeName,
      category: item.product.category.name,
      categorySlug: item.product.category.slug,
      variants: item.product.productvariant.map((variant) => ({
        id: variant.productVariantId,
        size: variant.size,
        color: variant.color,
        price: variant.price ? Number(variant.price) : null,
        stock: variant.stockQuantity,
      })),
    })),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ comparisonId: string }> },
) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const { comparisonId } = await params;
  const comparison = await prisma.comparison.findFirst({
    where: { comparisonId, userId: access.user.id },
    include: {
      comparisonitem: {
        include: {
          product: {
            include: {
              merchant: true,
              category: true,
              productvariant: true,
            },
          },
        },
      },
    },
  });

  if (!comparison) {
    return NextResponse.json({ message: "Comparison not found." }, { status: 404 });
  }

  return NextResponse.json({ comparison: comparisonDetailsDto(comparison) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ comparisonId: string }> },
) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const { comparisonId } = await params;
  const deleted = await prisma.comparison.deleteMany({
    where: { comparisonId, userId: access.user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ message: "Comparison not found." }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ comparisonId: string }> },
) {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter a name or select between one and four products." }, { status: 400 });
  const { comparisonId } = await params;
  const existing = await prisma.comparison.findFirst({ where: { comparisonId, userId: access.user.id }, select: { comparisonId: true } });
  if (!existing) return NextResponse.json({ message: "Comparison not found." }, { status: 404 });

  if (parsed.data.productIds) {
    const productIds = [...new Set(parsed.data.productIds)];
    if (productIds.length !== parsed.data.productIds.length) return NextResponse.json({ message: "A product can only appear once in a comparison." }, { status: 400 });
    const products = await prisma.product.findMany({ where: { productId: { in: productIds }, status: "ACTIVE" }, select: { productId: true } });
    if (products.length !== productIds.length) return NextResponse.json({ message: "One or more products are unavailable." }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.comparisonitem.deleteMany({ where: { comparisonId } });
      await tx.comparisonitem.createMany({ data: productIds.map((productId) => ({ comparisonItemId: randomUUID(), comparisonId, productId })) });
      await tx.comparison.update({ where: { comparisonId }, data: { ...(parsed.data.name === undefined ? {} : { name: parsed.data.name }), updatedAt: new Date() } });
    });
  } else {
    await prisma.comparison.update({ where: { comparisonId }, data: { name: parsed.data.name, updatedAt: new Date() } });
  }
  return NextResponse.json({ updated: true });
}
