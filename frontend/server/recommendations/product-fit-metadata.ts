import {
  FIT_DIMENSIONS,
  type FitRange,
  type VariantFitRanges,
} from "./types";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseFitRange(value: unknown): FitRange | null {
  if (!isRecord(value)) {
    return null;
  }

  const { min, max } = value;

  if (
    typeof min !== "number" ||
    typeof max !== "number" ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min <= 0 ||
    max < min
  ) {
    return null;
  }

  return {
    min,
    max,
  };
}

export function parseVariantFitRanges(
  metadata: unknown,
): VariantFitRanges {
  if (!isRecord(metadata)) {
    return {};
  }

  const fitRanges = metadata.fitRangesCm;

  if (!isRecord(fitRanges)) {
    return {};
  }

  const result: VariantFitRanges = {};

  for (const dimension of FIT_DIMENSIONS) {
    const range = parseFitRange(fitRanges[dimension]);

    if (range) {
      result[dimension] = range;
    }
  }

  return result;
}