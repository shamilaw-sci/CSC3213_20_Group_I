import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFavorites: vi.fn(),
  findRedirects: vi.fn(),
  findTryOns: vi.fn(),
  findComparisons: vi.fn(),
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    favorite: { findMany: mocks.findFavorites },
    merchantredirect: { findMany: mocks.findRedirects },
    tryonsession: { findMany: mocks.findTryOns },
    comparisonitem: { findMany: mocks.findComparisons },
  },
}));

import { loadInterestSignals } from "../../../server/recommendations/load-interest-signals";

describe("load recommendation interest signals", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findFavorites.mockResolvedValue([]);
    mocks.findRedirects.mockResolvedValue([]);
    mocks.findTryOns.mockResolvedValue([]);
    mocks.findComparisons.mockResolvedValue([]);
  });

  it("returns no signals when the user has no history", async () => {
    expect(await loadInterestSignals("user-1")).toEqual([]);
  });

  it("maps favorites and redirects, newest first", async () => {
    const older = new Date("2026-09-01T10:00:00Z");
    const newer = new Date("2026-09-02T10:00:00Z");

    mocks.findFavorites.mockResolvedValue([
      {
        createdAt: older,
        product: { categoryId: "category-1", merchantId: "merchant-1" },
      },
    ]);
    mocks.findRedirects.mockResolvedValue([
      {
        createdAt: newer,
        product: { categoryId: "category-2", merchantId: "merchant-2" },
      },
    ]);

    expect(await loadInterestSignals("user-1")).toEqual([
      {
        type: "REDIRECT",
        categoryId: "category-2",
        merchantId: "merchant-2",
        occurredAt: newer,
      },
      {
        type: "FAVORITE",
        categoryId: "category-1",
        merchantId: "merchant-1",
        occurredAt: older,
      },
    ]);
  });

  it("maps try-on and comparison activity into interest signals", async () => {
    const tryOnDate = new Date("2026-09-03T10:00:00Z");
    const comparisonDate = new Date("2026-09-02T10:00:00Z");
    mocks.findTryOns.mockResolvedValue([
      { createdAt: tryOnDate, product: { categoryId: "category-1", merchantId: "merchant-1" } },
    ]);
    mocks.findComparisons.mockResolvedValue([
      { addedAt: comparisonDate, product: { categoryId: "category-2", merchantId: "merchant-2" } },
    ]);

    expect(await loadInterestSignals("user-1")).toEqual([
      { type: "TRY_ON", categoryId: "category-1", merchantId: "merchant-1", occurredAt: tryOnDate },
      { type: "COMPARISON", categoryId: "category-2", merchantId: "merchant-2", occurredAt: comparisonDate },
    ]);
  });

  it("queries only the requested user's recent history", async () => {
    await loadInterestSignals("user-1");

    for (const query of [mocks.findFavorites, mocks.findRedirects, mocks.findTryOns]) {
      expect(query).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      );
    }
    expect(mocks.findComparisons).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { comparison: { userId: "user-1" } },
        orderBy: { addedAt: "desc" },
        take: 50,
      }),
    );
  });
});
