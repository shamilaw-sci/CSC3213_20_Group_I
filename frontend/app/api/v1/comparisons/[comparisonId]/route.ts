import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

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
