import { describe, expect, it } from "vitest";

import { parseVariantFitRanges } from "../../../server/recommendations/product-fit-metadata";

describe("product variant fit metadata", () => {
  it("parses valid centimetre ranges", () => {
    const result = parseVariantFitRanges({
      fitRangesCm: {
        chest: { min: 86, max: 92 },
        waist: { min: 70, max: 76 },
        hips: { min: 90, max: 98 },
        shoulder: { min: 38, max: 42 },
      },
    });

    expect(result).toEqual({
      chest: { min: 86, max: 92 },
      waist: { min: 70, max: 76 },
      hips: { min: 90, max: 98 },
      shoulder: { min: 38, max: 42 },
    });
  });

  it("supports partially available measurement ranges", () => {
    const result = parseVariantFitRanges({
      fitRangesCm: {
        chest: { min: 86, max: 92 },
      },
    });

    expect(result).toEqual({
      chest: { min: 86, max: 92 },
    });
  });

  it("ignores unsupported metadata properties", () => {
    const result = parseVariantFitRanges({
      fitRangesCm: {
        chest: { min: 86, max: 92 },
        sleeve: { min: 55, max: 65 },
      },
      supplierReference: "external-123",
    });

    expect(result).toEqual({
      chest: { min: 86, max: 92 },
    });
  });

  it("returns no ranges when fit metadata is missing", () => {
    expect(parseVariantFitRanges({})).toEqual({});

    expect(
      parseVariantFitRanges({
        description: "No size chart",
      }),
    ).toEqual({});
  });

  it("returns no ranges for invalid metadata values", () => {
    expect(parseVariantFitRanges(null)).toEqual({});
    expect(parseVariantFitRanges([])).toEqual({});
    expect(parseVariantFitRanges("invalid")).toEqual({});
    expect(parseVariantFitRanges(42)).toEqual({});
  });

  it("ignores malformed ranges while preserving valid ranges", () => {
    const result = parseVariantFitRanges({
      fitRangesCm: {
        chest: { min: "86", max: 92 },
        waist: { min: 76, max: 70 },
        hips: { min: -1, max: 98 },
        shoulder: { min: 38, max: 42 },
      },
    });

    expect(result).toEqual({
      shoulder: { min: 38, max: 42 },
    });
  });
});