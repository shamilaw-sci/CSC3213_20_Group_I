import { describe, expect, it } from "vitest";

import {
  calculateDimensionFit,
  recommendBestSize,
  scoreVariantFit,
} from "../../../server/recommendations/fit-score";
import type { VariantFitInput } from "../../../server/recommendations/types";

describe("Digital Twin recommendation fit scoring", () => {
  it("gives a perfect score when a measurement is at the range midpoint", () => {
    const result = calculateDimensionFit("chest", 89, {
      min: 86,
      max: 92,
    });

    expect(result.score).toBe(100);
    expect(result.withinRange).toBe(true);
    expect(result.explanation).toContain(
      "within the recommended range",
    );
  });

  it("gives a valid score at the edge of a size range", () => {
    const result = calculateDimensionFit("chest", 86, {
      min: 86,
      max: 92,
    });

    expect(result.score).toBe(90);
    expect(result.withinRange).toBe(true);
  });

  it("reduces the score when a measurement is outside the range", () => {
    const result = calculateDimensionFit("chest", 84, {
      min: 86,
      max: 92,
    });

    expect(result.score).toBe(74);
    expect(result.withinRange).toBe(false);
    expect(result.explanation).toContain(
      "2 cm below the recommended range",
    );
  });

  it("selects the highest-scoring available size", () => {
    const variants: VariantFitInput[] = [
      {
        variantId: "variant-s",
        size: "S",
        ranges: {
          chest: { min: 80, max: 85 },
          waist: { min: 65, max: 69 },
        },
      },
      {
        variantId: "variant-m",
        size: "M",
        ranges: {
          chest: { min: 86, max: 92 },
          waist: { min: 70, max: 76 },
        },
      },
      {
        variantId: "variant-l",
        size: "L",
        ranges: {
          chest: { min: 93, max: 99 },
          waist: { min: 77, max: 83 },
        },
      },
    ];

    const result = recommendBestSize(
      {
        chest: 88,
        waist: 72,
      },
      variants,
    );

    expect(result.recommendedVariantId).toBe("variant-m");
    expect(result.recommendedSize).toBe("M");
    expect(result.fitScore).toBe(97);
    expect(result.comparedDimensions).toBe(2);
    expect(result.reasons).toHaveLength(2);
  });

  it("uses only measurements available on both sides", () => {
    const result = scoreVariantFit(
      {
        chest: 89,
        waist: null,
      },
      {
        variantId: "variant-m",
        size: "M",
        ranges: {
          chest: { min: 86, max: 92 },
          waist: { min: 70, max: 76 },
        },
      },
    );

    expect(result.fitScore).toBe(100);
    expect(result.comparedDimensions).toBe(1);
    expect(result.details).toHaveLength(1);
  });

  it("returns no recommendation when measurements are missing", () => {
    const result = recommendBestSize(
      {},
      [
        {
          variantId: "variant-m",
          size: "M",
          ranges: {
            chest: { min: 86, max: 92 },
          },
        },
      ],
    );

    expect(result).toEqual({
      recommendedVariantId: null,
      recommendedSize: null,
      fitScore: null,
      comparedDimensions: 0,
      reasons: [],
    });
  });

  it("returns no fit score when variant ranges are unavailable", () => {
    const result = scoreVariantFit(
      {
        chest: 89,
      },
      {
        variantId: "variant-m",
        size: "M",
        ranges: {},
      },
    );

    expect(result.fitScore).toBeNull();
    expect(result.comparedDimensions).toBe(0);
    expect(result.details).toEqual([]);
  });
});
