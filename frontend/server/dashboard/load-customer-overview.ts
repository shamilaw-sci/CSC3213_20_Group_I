import "server-only";

import { prisma } from "@/server/db/prisma";

export async function loadCustomerOverview(userId: string) {
  const [profile, digitalTwin, favoritesCount, recentTryOns] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: {
        measurement: {
          select: {
            heightCm: true,
            weightKg: true,
            chestCm: true,
            waistCm: true,
            hipsCm: true,
            shoulderCm: true,
          },
        },
      },
    }),
    prisma.digitaltwin.findFirst({
      where: { userId, status: "READY", deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.favorite.count({
      where: { userId, product: { status: "ACTIVE" } },
    }),
    prisma.tryonsession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        tryOnSessionId: true,
        createdAt: true,
        status: true,
        product: { select: { productId: true, productName: true } },
      },
    }),
  ]);

  const measurements = profile?.measurement;
  const savedMeasurementCount = measurements
    ? [
        measurements.heightCm,
        measurements.weightKg,
        measurements.chestCm,
        measurements.waistCm,
        measurements.hipsCm,
        measurements.shoulderCm,
      ].filter((value) => value !== null).length
    : 0;

  return {
    hasProfile: Boolean(profile),
    savedMeasurementCount,
    digitalTwinCreatedAt: digitalTwin?.createdAt ?? null,
    favoritesCount,
    recentTryOns,
  };
}
