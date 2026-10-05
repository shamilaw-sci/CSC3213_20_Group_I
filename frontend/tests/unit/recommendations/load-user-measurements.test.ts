import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findProfile: vi.fn(),
  findTwin: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    profile: { findUnique: mocks.findProfile },
    digitaltwin: { findFirst: mocks.findTwin },
  },
}));

import { loadUserMeasurements } from "../../../server/recommendations/load-user-measurements";

describe("load recommendation measurements", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findProfile.mockResolvedValue(null);
    mocks.findTwin.mockResolvedValue(null);
  });

  it("uses current Profile values and fills gaps from the Digital Twin", async () => {
    mocks.findProfile.mockResolvedValue({
      measurement: {
        chestCm: { toString: () => "90.5" },
        waistCm: null,
        hipsCm: null,
        shoulderCm: 40,
      },
    });
    mocks.findTwin.mockResolvedValue({
      measurementsSnapshot: {
        chest: "86",
        waist: "72",
        hips: "96",
        shoulder: "38",
      },
    });

    const result = await loadUserMeasurements("user-123");

    expect(result).toEqual({
      chest: 90.5,
      waist: 72,
      hips: 96,
      shoulder: 40,
    });
  });

  it("uses the snapshot if the Profile is missing", async () => {
    mocks.findTwin.mockResolvedValue({
      measurementsSnapshot: { chest: "88", waist: "72" },
    });

    expect(await loadUserMeasurements("user-123")).toEqual({
      chest: 88,
      waist: 72,
    });
  });

  it("returns no measurements when both sources are missing", async () => {
    expect(await loadUserMeasurements("user-123")).toEqual({});
  });

  it("queries only the requested user and an undeleted READY twin", async () => {
    await loadUserMeasurements("user-123");

    expect(mocks.findProfile).toHaveBeenCalledWith({
      where: { userId: "user-123" },
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
    });

    expect(mocks.findTwin).toHaveBeenCalledWith({
      where: {
        userId: "user-123",
        status: "READY",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { measurementsSnapshot: true },
    });
  });
});