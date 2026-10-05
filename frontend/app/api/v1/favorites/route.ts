import { NextResponse } from "next/server";

import { requireAuthenticatedUser } from "@/server/auth/authorization";
import { prisma } from "@/server/db/prisma";

type DecimalLike = { toString: () => string };
type FavoriteRow = {
  favoriteId: string;
  product: {
    productId: string;
    productName: string;
    price: DecimalLike;
    primaryImageUrl: string | null;
    merchant: { storeName: string };
    category: { name: string; slug: string };
  };
};

export async function GET() {
  const access = await requireAuthenticatedUser();
  if ("error" in access) return access.error;

  const favorites = await prisma.favorite.findMany({
    where: { userId: access.user.id, product: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          merchant: true,
          category: true,
        },
      },
    },
  });

  return NextResponse.json({
    favorites: favorites.map((favorite: FavoriteRow) => ({
      id: favorite.favoriteId,
      product: {
        id: favorite.product.productId,
        name: favorite.product.productName,
        price: Number(favorite.product.price),
        image: favorite.product.primaryImageUrl,
        merchant: { name: favorite.product.merchant.storeName },
        category: {
          name: favorite.product.category.name,
          slug: favorite.product.category.slug,
        },
      },
    })),
  });
}
