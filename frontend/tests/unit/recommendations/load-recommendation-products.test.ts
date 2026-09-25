import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn() }));

vi.mock("@/server/db/prisma", () => ({
  prisma: { product: { findMany: mocks.findMany } },
}));

import { loadRecommendationProducts } from "../../../server/recommendations/load-recommendation-products";

describe("load recommendation products", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findMany.mockResolvedValue([]);
  });

  it("requests active products, active merchants and in-stock variants", async () => {
    await loadRecommendationProducts();

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "ACTIVE",
          merchant: { is: { status: "ACTIVE" } },
        },
        take: 100,
        select: expect.objectContaining({
          productvariant: expect.objectContaining({
            where: { stockQuantity: { gt: 0 } },
          }),
        }),
      }),
    );
  });

  it("maps product details and fit metadata", async () => {
    mocks.findMany.mockResolvedValue([{
      productId: "product-1",
      productName: "Blue Shirt",
      primaryImageUrl: "/shirt.png",
      price: { toString: () => "49.50" },
      currency: "USD",
      categoryId: "category-1",
      merchantId: "merchant-1",
      category: { name: "Shirts" },
      merchant: { storeName: "Example Store" },
      productvariant: [{
        productVariantId: "variant-1",
        size: "M",
        color: "Blue",
        metadata: { fitRangesCm: { chest: { min: 86, max: 92 } } },
      }],
    }]);

    expect(await loadRecommendationProducts()).toEqual([{
      id: "product-1",
      name: "Blue Shirt",
      imageUrl: "/shirt.png",
      merchantName: "Example Store",
      categoryName: "Shirts",
      price: 49.5,
      currency: "USD",
      candidate: {
        productId: "product-1",
        categoryId: "category-1",
        merchantId: "merchant-1",
        variants: [{
          variantId: "variant-1",
          size: "M",
          color: "Blue",
          metadata: { fitRangesCm: { chest: { min: 86, max: 92 } } },
        }],
      },
    }]);
  });

  it("returns an empty list when no products are available", async () => {
    expect(await loadRecommendationProducts()).toEqual([]);
  });
});