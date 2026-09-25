import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

type DecimalLike = { toString: () => string };
type ComparisonRow = {
  comparisonId: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparisonitem: {
    comparisonItemId: string;
    product: {
      productId: string;
      productName: string;
      price: DecimalLike;
      currency: string;
      primaryImageUrl: string | null;
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

function comparisonDto(comparison: ComparisonRow) {
  return {
    id: comparison.comparisonId,
    name: comparison.name,
    createdAt: comparison.createdAt,
    updatedAt: comparison.updatedAt,
    products: comparison.comparisonitem.map((item) => ({
      id: item.product.productId,
      name: item.product.productName,
      price: Number(item.product.price),
      currency: item.product.currency,
      image: item.product.primaryImageUrl,
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

export async function GET() {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const comparisons = await prisma.comparison.findMany({
    where: { userId: access.user.id },
    orderBy: { updatedAt: "desc" },
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

  return NextResponse.json({ comparisons: comparisons.map(comparisonDto) });
}
