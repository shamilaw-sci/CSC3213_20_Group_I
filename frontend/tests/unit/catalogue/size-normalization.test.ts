import { describe, expect, it } from "vitest";

import {
  fitRangesCmSchema,
  recommendSizeFromFitRanges,
  sortSizes,
} from "../../../server/modules/products/size-normalization";

describe("product size normalization", () => {
  it("normalizes and sorts common merchant size labels", () => {
    expect(sortSizes(["Large", "small", "2xl", "Medium"])).toEqual(["S", "M", "L", "XXL"]);
  });

  it("validates merchant fit ranges", () => {
    expect(fitRangesCmSchema.safeParse({ chest: { min: 90, max: 100 } }).success).toBe(true);
    expect(fitRangesCmSchema.safeParse({ chest: { min: 100, max: 90 } }).success).toBe(false);
    expect(fitRangesCmSchema.safeParse({}).success).toBe(false);
  });

  it("does not recommend from a generic chart when merchant fit ranges are missing", () => {
    const result = recommendSizeFromFitRanges(
      { chestCm: 92, waistCm: 75, hipsCm: 98 },
      [{ size: "M", fitRangesCm: null }],
    );

    expect(result).toEqual({
      recommendedSize: null,
      confidence: "unavailable",
      reason: "No merchant fit ranges are available for this product.",
    });
  });

  it("recommends using merchant-provided fit ranges", () => {
    const result = recommendSizeFromFitRanges(
      { chestCm: 91, waistCm: 74, hipsCm: 98 },
      [
        { size: "S", fitRangesCm: { chest: { min: 82, max: 88 }, waist: { min: 66, max: 72 } } },
        { size: "M", fitRangesCm: { chest: { min: 89, max: 96 }, waist: { min: 73, max: 80 } } },
      ],
    );

    expect(result.recommendedSize).toBe("M");
    expect(result.confidence).toBe("fit_range_match");
  });
});
