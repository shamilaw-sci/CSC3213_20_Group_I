import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchJsonWithLimits: vi.fn(),
  categoryFindUnique: vi.fn(),
  productUpsert: vi.fn(),
  productVariantDeleteMany: vi.fn(),
  productVariantCreateMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/modules/products/size-normalization", async () => import("../../../server/modules/products/size-normalization"));

vi.mock("@/server/security/safe-fetch", () => ({
  fetchJsonWithLimits: mocks.fetchJsonWithLimits,
}));

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    category: { findUnique: mocks.categoryFindUnique },
    product: { upsert: mocks.productUpsert },
    productvariant: {
      deleteMany: mocks.productVariantDeleteMany,
      createMany: mocks.productVariantCreateMany,
    },
  },
}));

import { syncMerchantJsonFeed } from "../../../server/integrations/merchants/json-feed";

const merchant = {
  merchantId: "merchant-1",
  websiteUrl: "https://merchant.example.test",
} as unknown as Parameters<typeof syncMerchantJsonFeed>[0];

const fitRangesCm = {
  chest: { min: 89, max: 96 },
  waist: { min: 73, max: 80 },
};

describe("Merchant JSON feed sync", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.categoryFindUnique.mockResolvedValue({ categoryId: "category-1" });
    mocks.productUpsert.mockResolvedValue({ productId: "product-1" });
    mocks.productVariantDeleteMany.mockResolvedValue({ count: 0 });
    mocks.productVariantCreateMany.mockResolvedValue({ count: 1 });
    mocks.fetchJsonWithLimits.mockResolvedValue({
      products: [{
        externalId: "demo-dress",
        categorySlug: "dresses",
        productName: "Demo Dress",
        price: 120,
        currency: "USD",
        merchantUrl: "https://merchant.example.test/products/demo-dress",
        variants: [{ sku: "demo-m", size: "M", stockQuantity: 5, fitRangesCm }],
      }],
    });
  });

  it("uses the safe fetcher and saves feed fit ranges", async () => {
    const result = await syncMerchantJsonFeed(merchant, "https://feeds.merchant.example.test/catalog.json");

    expect(result).toEqual({ upserted: 1 });
    expect(mocks.fetchJsonWithLimits).toHaveBeenCalledWith("https://feeds.merchant.example.test/catalog.json");
    expect(mocks.productVariantCreateMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        productId: "product-1",
        sku: "demo-m",
        metadata: { fitRangesCm },
      })],
    });
  });

  it("rejects feeds outside the merchant website host before fetching", async () => {
    await expect(syncMerchantJsonFeed(merchant, "https://attacker.example.test/catalog.json")).rejects.toThrow("Merchant feed URL must belong to the merchant website.");

    expect(mocks.fetchJsonWithLimits).not.toHaveBeenCalled();
    expect(mocks.productUpsert).not.toHaveBeenCalled();
  });

  it("rejects invalid feed fit ranges", async () => {
    mocks.fetchJsonWithLimits.mockResolvedValueOnce({
      products: [{
        externalId: "bad-dress",
        categorySlug: "dresses",
        productName: "Bad Dress",
        price: 120,
        merchantUrl: "https://merchant.example.test/products/bad-dress",
        variants: [{ sku: "bad-m", fitRangesCm: { chest: { min: 96, max: 89 } } }],
      }],
    });

    await expect(syncMerchantJsonFeed(merchant, "https://merchant.example.test/feed.json")).rejects.toThrow();
    expect(mocks.productUpsert).not.toHaveBeenCalled();
  });
});


