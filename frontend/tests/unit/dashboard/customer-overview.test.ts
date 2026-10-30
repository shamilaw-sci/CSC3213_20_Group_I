import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  profileFindUnique: vi.fn(),
  twinFindFirst: vi.fn(),
  favoriteCount: vi.fn(),
  tryOnFindMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/server/db/prisma", () => ({
  prisma: {
    profile: { findUnique: mocks.profileFindUnique },
    digitaltwin: { findFirst: mocks.twinFindFirst },
    favorite: { count: mocks.favoriteCount },
    tryonsession: { findMany: mocks.tryOnFindMany },
  },
}));

import { loadCustomerOverview } from "../../../server/dashboard/load-customer-overview";

describe("customer dashboard overview", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.profileFindUnique.mockResolvedValue(null);
    mocks.twinFindFirst.mockResolvedValue(null);
    mocks.favoriteCount.mockResolvedValue(0);
    mocks.tryOnFindMany.mockResolvedValue([]);
  });

  it("scopes every dashboard read to the current user", async () => {
    await loadCustomerOverview("customer-123");

    expect(mocks.profileFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "customer-123" },
    }));
    expect(mocks.twinFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "customer-123", status: "READY", deletedAt: null },
    }));
    expect(mocks.favoriteCount).toHaveBeenCalledWith({
      where: { userId: "customer-123", product: { status: "ACTIVE" } },
    });
    expect(mocks.tryOnFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: "customer-123" },
      take: 3,
    }));
  });

  it("shows real saved data without filling missing measurements", async () => {
    const createdAt = new Date("2026-10-01T08:00:00Z");
    const recentTryOn = {
      tryOnSessionId: "try-on-1",
      createdAt,
      status: "COMPLETED",
      product: { productId: "product-1", productName: "Blue shirt" },
    };
    mocks.profileFindUnique.mockResolvedValue({
      measurement: {
        heightCm: 170,
        weightKg: null,
        chestCm: 88,
        waistCm: 72,
        hipsCm: null,
        shoulderCm: null,
      },
    });
    mocks.twinFindFirst.mockResolvedValue({ createdAt });
    mocks.favoriteCount.mockResolvedValue(2);
    mocks.tryOnFindMany.mockResolvedValue([recentTryOn]);

    await expect(loadCustomerOverview("customer-123")).resolves.toEqual({
      hasProfile: true,
      savedMeasurementCount: 3,
      digitalTwinCreatedAt: createdAt,
      favoritesCount: 2,
      recentTryOns: [recentTryOn],
    });
  });

  it("returns empty states when customer data has not been created", async () => {
    await expect(loadCustomerOverview("new-customer")).resolves.toEqual({
      hasProfile: false,
      savedMeasurementCount: 0,
      digitalTwinCreatedAt: null,
      favoritesCount: 0,
      recentTryOns: [],
    });
  });
});
