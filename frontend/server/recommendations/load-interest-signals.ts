import { prisma } from "@/server/db/prisma";

import type { InterestSignal } from "./types";

export async function loadInterestSignals(
  userId: string,
): Promise<InterestSignal[]> {
  const [favorites, redirects, tryOns, comparisons] = await Promise.all([
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
    prisma.tryonsession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        createdAt: true,
        product: { select: { categoryId: true, merchantId: true } },
      },
    }),
    prisma.comparisonitem.findMany({
      where: { comparison: { userId } },
      orderBy: { addedAt: "desc" },
      take: 50,
      select: {
        addedAt: true,
        product: { select: { categoryId: true, merchantId: true } },
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

  const tryOnSignals: InterestSignal[] = tryOns.map((tryOn) => ({
    type: "TRY_ON",
    categoryId: tryOn.product.categoryId,
    merchantId: tryOn.product.merchantId,
    occurredAt: tryOn.createdAt,
  }));

  const comparisonSignals: InterestSignal[] = comparisons.map((comparison) => ({
    type: "COMPARISON",
    categoryId: comparison.product.categoryId,
    merchantId: comparison.product.merchantId,
    occurredAt: comparison.addedAt,
  }));

  return [...favoriteSignals, ...redirectSignals, ...tryOnSignals, ...comparisonSignals].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
}
