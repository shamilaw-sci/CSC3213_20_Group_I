import { describe, expect, it } from "vitest";

import {
  normalizeDigitalTwinSnapshot,
  normalizeProfileMeasurements,
  resolveUserMeasurements,
} from "../../../server/recommendations/measurement-normalizer";

describe("recommendation measurement normalization", () => {
  it("normalizes live Profile measurement values", () => {
    const result = normalizeProfileMeasurements({
      chestCm: 88,
      waistCm: 72,
      hipsCm: 96,
      shoulderCm: 40,
      heightCm: 165,
      weightKg: 60,
    });

    expect(result).toEqual({
      chest: 88,
      waist: 72,
      hips: 96,
      shoulder: 40,
    });
  });

  it("supports Prisma decimal-like objects and numeric strings", () => {
    const result = normalizeProfileMeasurements({
      chestCm: {
        toString: () => "88.5",
      },
      waistCm: "72.25",
      hipsCm: {
        toString: () => "96",
      },
      shoulderCm: "40",
    });

    expect(result).toEqual({
      chest: 88.5,
      waist: 72.25,
      hips: 96,
      shoulder: 40,
    });
  });

  it("normalizes Digital Twin snapshot strings", () => {
    const result = normalizeDigitalTwinSnapshot({
      chest: "88",
      waist: "72",
      hips: "96",
      shoulder: "40",
      height: "165",
      weight: "60",
    });

    expect(result).toEqual({
      chest: 88,
      waist: 72,
      hips: 96,
      shoulder: 40,
    });
  });

  it("prioritizes current Profile measurements", () => {
    const result = resolveUserMeasurements(
      {
        chestCm: 90,
        waistCm: 74,
      },
      {
        chest: "86",
        waist: "70",
        hips: "96",
        shoulder: "40",
      },
    );

    expect(result).toEqual({
      chest: 90,
      waist: 74,
      hips: 96,
      shoulder: 40,
    });
  });

  it("uses the Digital Twin snapshot when Profile values are missing", () => {
    const result = resolveUserMeasurements(
      {
        chestCm: 90,
        waistCm: null,
        hipsCm: 0,
      },
      {
        chest: "86",
        waist: "72",
        hips: "96",
      },
    );

    expect(result).toEqual({
      chest: 90,
      waist: 72,
      hips: 96,
    });
  });

  it("ignores invalid, zero and negative measurement values", () => {
    expect(
      normalizeProfileMeasurements({
        chestCm: 0,
        waistCm: -1,
        hipsCm: "invalid",
        shoulderCm: Number.NaN,
      }),
    ).toEqual({});

    expect(normalizeDigitalTwinSnapshot(null)).toEqual({});
    expect(normalizeDigitalTwinSnapshot([])).toEqual({});
  });
});
