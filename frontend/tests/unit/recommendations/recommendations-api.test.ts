import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  measurements: vi.fn(),
  signals: vi.fn(),
  products: vi.fn(),
  recommend: vi.fn(),
}));

vi.mock("@/server/auth/authorization", () => ({
  requireAuthenticatedUser: mocks.auth,
}));
vi.mock("@/server/recommendations/load-user-measurements", () => ({
  loadUserMeasurements: mocks.measurements,
}));
vi.mock("@/server/recommendations/load-interest-signals", () => ({
  loadInterestSignals: mocks.signals,
}));
vi.mock("@/server/recommendations/load-recommendation-products", () => ({
  loadRecommendationProducts: mocks.products,
}));
vi.mock("@/server/recommendations/recommend-products", () => ({
  recommendProducts: mocks.recommend,
}));

import { GET } from "../../../app/api/v1/recommendations/route";

const product = {
  id: "product-1",
  name: "Blue Shirt",
  imageUrl: "/shirt.jpg",
  merchantName: "Example Store",
  categoryName: "Shirts",
  price: 25,
  currency: "USD",
  candidate: {
    productId: "product-1",
    categoryId: "category-1",
    merchantId: "merchant-1",
    variants: [],
  },
};

const recommendation = {
  productId: "product-1",
  recommendedVariantId: null,
  recommendedSize: null,
  fitScore: null,
  interestScore: null,
  recommendationScore: null,
  comparedDimensions: 0,
  mode: "general",
  reasons: [],
};

describe("recommendations API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.measurements.mockResolvedValue({});
    mocks.signals.mockResolvedValue([]);
    mocks.products.mockResolvedValue([product]);
    mocks.recommend.mockReturnValue([recommendation]);
  });

  it("requires authentication before loading private data", async () => {
    const denied = new Response("Authentication required", { status: 401 });
    mocks.auth.mockResolvedValue({ error: denied });

    expect(await GET()).toBe(denied);
    expect(mocks.measurements).not.toHaveBeenCalled();
    expect(mocks.signals).not.toHaveBeenCalled();
  });

  it("returns ranked products without exposing private inputs", async () => {
    const measurements = { chest: 88 };
    const signals = [{
      type: "FAVORITE",
      categoryId: "category-1",
      occurredAt: new Date(),
    }];
    mocks.measurements.mockResolvedValue(measurements);
    mocks.signals.mockResolvedValue(signals);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.measurements).toHaveBeenCalledWith("user-1");
    expect(mocks.signals).toHaveBeenCalledWith("user-1");
    expect(mocks.recommend).toHaveBeenCalledWith(
      measurements,
      [product.candidate],
      signals,
    );
    expect(body.hasMeasurements).toBe(true);
    expect(body.hasInterestHistory).toBe(true);
    expect(body.recommendations[0].product.name).toBe("Blue Shirt");
    expect(body.recommendations[0].product.availableSizes).toEqual([]);
    expect(body).not.toHaveProperty("measurements");
    expect(body).not.toHaveProperty("interestSignals");
  });

  it("still returns a general feed without measurements or history", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.hasMeasurements).toBe(false);
    expect(body.hasInterestHistory).toBe(false);
    expect(body.recommendations).toHaveLength(1);
  });

  it("passes only distinct in-stock variant sizes to the Try-On client", async () => {
    mocks.products.mockResolvedValue([{
      ...product,
      candidate: {
        ...product.candidate,
        variants: [
          { variantId: "variant-1", size: "M", color: null, metadata: null },
          { variantId: "variant-2", size: " M ", color: null, metadata: null },
          { variantId: "variant-3", size: null, color: null, metadata: null },
          { variantId: "variant-4", size: "L", color: null, metadata: null },
        ],
      },
    }]);

    const response = await GET();
    const body = await response.json();

    expect(body.recommendations[0].product.availableSizes).toEqual(["M", "L"]);
    expect(body.recommendations[0].product.currency).toBe("USD");
  });
});
