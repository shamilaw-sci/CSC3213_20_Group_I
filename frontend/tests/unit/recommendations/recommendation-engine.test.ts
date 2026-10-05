import { describe, expect, it } from "vitest";

import {
  combineRecommendationScores,
  rankRecommendations,
} from "../../../server/recommendations/recommendation-engine";

describe("combined recommendation scoring", () => {
  it("combines fit and interest using the default 60/40 weights", () => {
    const result = combineRecommendationScores({
      productId: "product-combined",
      fitScore: 90,
      interestScore: 70,
      fitReasons: ["Matches your measurements."],
      interestReasons: ["Matches a preferred category."],
    });

    expect(result.recommendationScore).toBe(82);
    expect(result.mode).toBe("combined");
    expect(result.fitScore).toBe(90);
    expect(result.interestScore).toBe(70);
    expect(result.reasons).toEqual([
      "Matches your measurements.",
      "Matches a preferred category.",
    ]);
  });

  it("uses the complete fit score when interest history is missing", () => {
    const result = combineRecommendationScores({
      productId: "product-fit",
      fitScore: 94,
      interestScore: null,
      fitReasons: ["Size M matches your measurements."],
    });

    expect(result.recommendationScore).toBe(94);
    expect(result.mode).toBe("fit");
    expect(result.interestScore).toBeNull();
  });

  it("uses the complete interest score when measurements are missing", () => {
    const result = combineRecommendationScores({
      productId: "product-interest",
      fitScore: null,
      interestScore: 78,
      interestReasons: ["Matches products you interacted with."],
    });

    expect(result.recommendationScore).toBe(78);
    expect(result.mode).toBe("interest");
    expect(result.fitScore).toBeNull();
  });

  it("uses general mode when both personalization sources are missing", () => {
    const result = combineRecommendationScores({
      productId: "product-general",
      fitScore: null,
      interestScore: null,
    });

    expect(result).toEqual({
      productId: "product-general",
      fitScore: null,
      interestScore: null,
      recommendationScore: null,
      mode: "general",
      reasons: [],
    });
  });

  it("supports configurable recommendation weights", () => {
    const result = combineRecommendationScores(
      {
        productId: "product-custom-weight",
        fitScore: 90,
        interestScore: 70,
      },
      {
        fit: 0.75,
        interest: 0.25,
      },
    );

    expect(result.recommendationScore).toBe(85);
  });

  it("keeps scores within the zero to one hundred range", () => {
    const result = combineRecommendationScores({
      productId: "product-bounded",
      fitScore: 120,
      interestScore: -20,
    });

    expect(result.fitScore).toBe(100);
    expect(result.interestScore).toBe(0);
    expect(result.recommendationScore).toBe(60);
  });

  it("removes duplicate and empty recommendation reasons", () => {
    const result = combineRecommendationScores({
      productId: "product-reasons",
      fitScore: 90,
      interestScore: 80,
      fitReasons: ["Matches your measurements.", ""],
      interestReasons: [
        "Matches your measurements.",
        "Matches your preferred category.",
      ],
    });

    expect(result.reasons).toEqual([
      "Matches your measurements.",
      "Matches your preferred category.",
    ]);
  });

  it("ranks personalized products before general products", () => {
    const results = rankRecommendations([
      {
        productId: "product-fit-80",
        fitScore: 80,
        interestScore: null,
      },
      {
        productId: "product-combined-90",
        fitScore: 90,
        interestScore: 90,
      },
      {
        productId: "product-general",
        fitScore: null,
        interestScore: null,
      },
      {
        productId: "product-interest-85",
        fitScore: null,
        interestScore: 85,
      },
    ]);

    expect(results.map((result) => result.productId)).toEqual([
      "product-combined-90",
      "product-interest-85",
      "product-fit-80",
      "product-general",
    ]);
  });
});
