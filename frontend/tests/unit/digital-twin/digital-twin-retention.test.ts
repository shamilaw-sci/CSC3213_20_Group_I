import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  deleteTwin: vi.fn(),
  detachTryOns: vi.fn(),
  transaction: vi.fn(),
  removeEncryptedTwin: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    digitaltwin: {
      findMany: mocks.findMany,
      delete: mocks.deleteTwin,
    },
    tryonsession: {
      updateMany: mocks.detachTryOns,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock(
  "@/server/storage/digital-twin-storage",
  () => ({
    removeEncryptedTwin:
      mocks.removeEncryptedTwin,
  }),
);

import { purgeExpiredDigitalTwins } from "../../../server/storage/digital-twin-retention";

const NOW = new Date("2026-09-12T12:00:00.000Z");
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

describe("purgeExpiredDigitalTwins", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.detachTryOns.mockReturnValue(
      "detach-operation",
    );
    mocks.deleteTwin.mockReturnValue(
      "delete-operation",
    );
    mocks.transaction.mockResolvedValue([]);
    mocks.removeEncryptedTwin.mockResolvedValue(
      undefined,
    );
  });

  it("purges an expired deleted twin", async () => {
    mocks.findMany.mockResolvedValue([
      {
        digitalTwinId: "twin-123",
        encryptedImagePath:
          "private/twin-123.bin",
        previewImagePath: null,
      },
    ]);

    const result = await purgeExpiredDigitalTwins({
      now: NOW,
      retentionDays: 30,
      batchSize: 25,
    });

    expect(mocks.findMany).toHaveBeenCalledWith({
      where: {
        status: "DELETED",
        deletedAt: {
          not: null,
          lte: new Date(
            NOW.getTime() -
              30 * DAY_IN_MILLISECONDS,
          ),
        },
      },
      orderBy: {
        deletedAt: "asc",
      },
      take: 25,
      select: {
        digitalTwinId: true,
        encryptedImagePath: true,
        previewImagePath: true,
      },
    });

    expect(
      mocks.removeEncryptedTwin,
    ).toHaveBeenCalledWith(
      "private/twin-123.bin",
    );

    expect(mocks.detachTryOns).toHaveBeenCalledWith({
      where: {
        digitalTwinId: "twin-123",
      },
      data: {
        digitalTwinId: null,
      },
    });

    expect(mocks.deleteTwin).toHaveBeenCalledWith({
      where: {
        digitalTwinId: "twin-123",
      },
    });

    expect(mocks.transaction).toHaveBeenCalledWith([
      "detach-operation",
      "delete-operation",
    ]);

    expect(result).toEqual({
      cutoff: "2026-08-13T12:00:00.000Z",
      scanned: 1,
      purged: 1,
      failed: 0,
      failedIds: [],
    });
  });

  it("removes a preview before deleting the record", async () => {
    mocks.findMany.mockResolvedValue([
      {
        digitalTwinId: "twin-preview",
        encryptedImagePath:
          "private/twin-preview.bin",
        previewImagePath:
          "private/twin-preview.jpg",
      },
    ]);

    await purgeExpiredDigitalTwins({
      now: NOW,
      retentionDays: 30,
    });

    expect(
      mocks.removeEncryptedTwin,
    ).toHaveBeenNthCalledWith(
      1,
      "private/twin-preview.bin",
    );
    expect(
      mocks.removeEncryptedTwin,
    ).toHaveBeenNthCalledWith(
      2,
      "private/twin-preview.jpg",
    );

    expect(
      mocks.removeEncryptedTwin.mock
        .invocationCallOrder[0],
    ).toBeLessThan(
      mocks.transaction.mock.invocationCallOrder[0],
    );
  });

  it("continues when one twin cannot be purged", async () => {
    mocks.findMany.mockResolvedValue([
      {
        digitalTwinId: "twin-success",
        encryptedImagePath:
          "private/twin-success.bin",
        previewImagePath: null,
      },
      {
        digitalTwinId: "twin-failed",
        encryptedImagePath:
          "private/twin-failed.bin",
        previewImagePath: null,
      },
    ]);

    mocks.removeEncryptedTwin
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        new Error("Storage unavailable"),
      );

    const result = await purgeExpiredDigitalTwins({
      now: NOW,
      retentionDays: 30,
    });

    expect(result).toEqual({
      cutoff: "2026-08-13T12:00:00.000Z",
      scanned: 2,
      purged: 1,
      failed: 1,
      failedIds: ["twin-failed"],
    });

    expect(mocks.transaction).toHaveBeenCalledTimes(
      1,
    );
  });

  it("rejects an unsafe retention period", async () => {
    await expect(
      purgeExpiredDigitalTwins({
        retentionDays: 0,
      }),
    ).rejects.toThrow(
      "Retention days must be between 1 and 3650.",
    );

    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
