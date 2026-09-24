import { prisma } from "@/server/db/prisma";

import { resolveUserMeasurements } from "./measurement-normalizer";
import type { UserMeasurements } from "./types";

export async function loadUserMeasurements(
  userId: string,
): Promise<UserMeasurements> {
  const [profile, digitalTwin] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      select: {
        measurement: {
          select: {
            chestCm: true,
            waistCm: true,
            hipsCm: true,
            shoulderCm: true,
          },
        },
      },
    }),
    prisma.digitaltwin.findFirst({
      where: {
        userId,
        status: "READY",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { measurementsSnapshot: true },
    }),
  ]);

  return resolveUserMeasurements(
    profile?.measurement,
    digitalTwin?.measurementsSnapshot,
  );
}