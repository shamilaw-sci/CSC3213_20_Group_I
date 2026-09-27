import { prisma } from "@/server/db/prisma";

import type { InterestSignal } from "./types";

export async function loadInterestSignals(
  userId: string,
): Promise<InterestSignal[]> {
  const [favorites, redirects] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        createdAt: true,
        product: {
          select: { categoryId: true, merchantId: true },
        },
      },
    }),
    prisma.merchantredirect.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        createdAt: true,
        product: {
          select: { categoryId: true, merchantId: true },
        },
      },
    }),
  ]);

  const favoriteSignals: InterestSignal[] = favorites.map((favorite) => ({
    type: "FAVORITE",
    categoryId: favorite.product.categoryId,
    merchantId: favorite.product.merchantId,
    occurredAt: favorite.createdAt,
  }));

  const redirectSignals: InterestSignal[] = redirects.map((redirect) => ({
    type: "REDIRECT",
    categoryId: redirect.product.categoryId,
    merchantId: redirect.product.merchantId,
    occurredAt: redirect.createdAt,
  }));

  return [...favoriteSignals, ...redirectSignals].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
}