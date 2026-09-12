import "server-only";

import { prisma } from "@/server/db/prisma";
import { removeEncryptedTwin } from "@/server/storage/digital-twin-storage";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 500;

interface RetentionOptions {
  now?: Date;
  retentionDays?: number;
  batchSize?: number;
}

function configuredRetentionDays() {
  const configuredValue = process.env.DELETED_TWIN_RETENTION_DAYS;

  if (!configuredValue) {
    return DEFAULT_RETENTION_DAYS;
  }

  const days = Number(configuredValue);

  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    throw new Error(
      "DELETED_TWIN_RETENTION_DAYS must be an integer between 1 and 3650.",
    );
  }

  return days;
}

export async function purgeExpiredDigitalTwins(
  options: RetentionOptions = {},
) {
  const now = options.now ?? new Date();
  const retentionDays =
    options.retentionDays ?? configuredRetentionDays();
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;

  if (
    !Number.isInteger(retentionDays) ||
    retentionDays < 1 ||
    retentionDays > 3650
  ) {
    throw new Error("Retention days must be between 1 and 3650.");
  }

  if (
    !Number.isInteger(batchSize) ||
    batchSize < 1 ||
    batchSize > MAX_BATCH_SIZE
  ) {
    throw new Error(
      `Batch size must be between 1 and ${MAX_BATCH_SIZE}.`,
    );
  }

  const cutoff = new Date(
    now.getTime() - retentionDays * MILLISECONDS_PER_DAY,
  );

  const expiredTwins = await prisma.digitaltwin.findMany({
    where: {
      status: "DELETED",
      deletedAt: {
        not: null,
        lte: cutoff,
      },
    },
    orderBy: {
      deletedAt: "asc",
    },
    take: batchSize,
    select: {
      digitalTwinId: true,
      encryptedImagePath: true,
      previewImagePath: true,
    },
  });

  const failedIds: string[] = [];
  let purged = 0;

  for (const twin of expiredTwins) {
    try {
      await removeEncryptedTwin(twin.encryptedImagePath);

      if (
        twin.previewImagePath &&
        twin.previewImagePath !== twin.encryptedImagePath
      ) {
        await removeEncryptedTwin(twin.previewImagePath);
      }

      await prisma.$transaction([
        prisma.tryonsession.updateMany({
          where: {
            digitalTwinId: twin.digitalTwinId,
          },
          data: {
            digitalTwinId: null,
          },
        }),
        prisma.digitaltwin.delete({
          where: {
            digitalTwinId: twin.digitalTwinId,
          },
        }),
      ]);

      purged += 1;
    } catch {
      failedIds.push(twin.digitalTwinId);
    }
  }

  return {
    cutoff: cutoff.toISOString(),
    scanned: expiredTwins.length,
    purged,
    failed: failedIds.length,
    failedIds,
  };
}