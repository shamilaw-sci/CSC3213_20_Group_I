import { prisma } from "@/server/db/prisma";

import type { RecommendationProductCandidate } from "./types";

export interface RecommendationCatalogProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  merchantName: string;
  categoryName: string;
  price: number;
  currency: string;
  candidate: RecommendationProductCandidate;
}

export async function loadRecommendationProducts(): Promise<
  RecommendationCatalogProduct[]
> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      merchant: {
        is: { status: "ACTIVE" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      productId: true,
      productName: true,
      primaryImageUrl: true,
      price: true,
      currency: true,
      categoryId: true,
      merchantId: true,
      category: {
        select: { name: true },
      },
      merchant: {
        select: { storeName: true },
      },
      productvariant: {
        where: {
          stockQuantity: { gt: 0 },
        },
        select: {
          productVariantId: true,
          size: true,
          color: true,
          metadata: true,
        },
      },
    },
  });

  return products.map((product) => ({
    id: product.productId,
    name: product.productName,
    imageUrl: product.primaryImageUrl,
    merchantName: product.merchant.storeName,
    categoryName: product.category.name,
    price: Number(product.price.toString()),
    currency: product.currency,
    candidate: {
      productId: product.productId,
      categoryId: product.categoryId,
      merchantId: product.merchantId,
      variants: product.productvariant.map((variant) => ({
        variantId: variant.productVariantId,
        size: variant.size,
        color: variant.color,
        metadata: variant.metadata,
      })),
    },
  }));
}