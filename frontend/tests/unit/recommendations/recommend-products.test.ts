import { describe, expect, it } from "vitest";

import { recommendProducts } from "../../../server/recommendations/recommend-products";
import type {
  InterestSignal,
  RecommendationProductCandidate,
} from "../../../server/recommendations/types";

const NOW = new Date("2026-09-24T10:00:00.000Z");

const matchingProduct: RecommendationProductCandidate = {
  productId: "product-shirt",
  categoryId: "category-shirts",
  merchantId: "merchant-tryvora",
  variants: [
    {
      variantId: "variant-shirt-m",
      size: "M",
      color: "Black",
      metadata: {
        fitRangesCm: {
          chest: { min: 86, max: 92 },
          waist: { min: 70, max: 76 },
        },
      },
    },
  ],
};

const matchingInterest: InterestSignal[] = [
  {
    type: "FAVORITE",
    categoryId: "category-shirts",
    merchantId: "merchant-tryvora",
    color: "black",
    occurredAt: new Date("2026-09-23T10:00:00.000Z"),
  },
];

describe("product recommendation orchestration", () => {
  it("creates a combined fit and interest recommendation", () => {
    const results = recommendProducts(
      {
        chest: 89,
        waist: 73,
      },
      [matchingProduct],
      matchingInterest,
      {
        now: NOW,
      },
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      productId: "product-shirt",
      recommendedVariantId: "variant-shirt-m",
      recommendedSize: "M",
      fitScore: 100,
      interestScore: 100,
      recommendationScore: 100,
      comparedDimensions: 2,
      mode: "combined",
    });

    expect(results[0]?.reasons).toContain(
      "Chest is within the recommended range.",
    );

    expect(results[0]?.reasons).toContain(
      "Matches categories from your recent activity.",
    );
  });

  it("creates a fit-only recommendation without history", () => {
    const results = recommendProducts(
      {
        chest: 89,
        waist: 73,
      },
      [matchingProduct],
      [],
      {
        now: NOW,
      },
    );

    expect(results[0]).toMatchObject({
      recommendedSize: "M",
      fitScore: 100,
      interestScore: null,
      recommendationScore: 100,
      mode: "fit",
    });
  });

  it("creates an interest-only recommendation without measurements", () => {
    const results = recommendProducts(
      {},
      [matchingProduct],
      matchingInterest,
      {
        now: NOW,
      },
    );

    expect(results[0]).toMatchObject({
      recommendedVariantId: null,
      recommendedSize: null,
      fitScore: null,
      interestScore: 100,
      recommendationScore: 100,
      comparedDimensions: 0,
      mode: "interest",
    });
  });

  it("returns general mode when personalization data is unavailable", () => {
    const generalProduct: RecommendationProductCandidate = {
      productId: "product-general",
      variants: [],
    };

    const results = recommendProducts(
      {},
      [generalProduct],
      [],
      {
        now: NOW,
      },
    );

    expect(results[0]).toEqual({
      productId: "product-general",
      recommendedVariantId: null,
      recommendedSize: null,
      fitScore: null,
      interestScore: null,
      recommendationScore: null,
      comparedDimensions: 0,
      mode: "general",
      reasons: [],
    });
  });

  it("ignores malformed variant metadata without crashing", () => {
    const malformedProduct: RecommendationProductCandidate = {
      productId: "product-malformed",
      variants: [
        {
          variantId: "variant-malformed",
          size: "M",
          color: null,
          metadata: {
            fitRangesCm: {
              chest: {
                min: "invalid",
                max: 92,
              },
            },
          },
        },
      ],
    };

    const results = recommendProducts(
      {
        chest: 89,
      },
      [malformedProduct],
      [],
      {
        now: NOW,
      },
    );

    expect(results[0]?.mode).toBe("general");
    expect(results[0]?.fitScore).toBeNull();
    expect(results[0]?.recommendedSize).toBeNull();
  });

  it("ranks the strongest recommendation first", () => {
    const generalProduct: RecommendationProductCandidate = {
      productId: "product-general",
      variants: [],
    };

    const weakerProduct: RecommendationProductCandidate = {
      productId: "product-weaker",
      categoryId: "category-other",
      variants: [
        {
          variantId: "variant-weaker",
          size: "L",
          color: "Red",
          metadata: {
            fitRangesCm: {
              chest: { min: 96, max: 102 },
              waist: { min: 82, max: 88 },
            },
          },
        },
      ],
    };

    const results = recommendProducts(
      {
        chest: 89,
        waist: 73,
      },
      [
        generalProduct,
        weakerProduct,
        matchingProduct,
      ],
      matchingInterest,
      {
        now: NOW,
      },
    );

    expect(results.map((result) => result.productId)).toEqual([
      "product-shirt",
      "product-weaker",
      "product-general",
    ]);
  });
});