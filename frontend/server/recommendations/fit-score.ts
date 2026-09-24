import {
  FIT_DIMENSIONS,
  type DimensionFitResult,
  type FitDimension,
  type FitRange,
  type SizeRecommendation,
  type UserMeasurements,
  type VariantFitInput,
  type VariantFitResult,
} from "./types";

function isValidMeasurement(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isValidRange(range: FitRange | undefined): range is FitRange {
  return (
    range !== undefined &&
    Number.isFinite(range.min) &&
    Number.isFinite(range.max) &&
    range.min > 0 &&
    range.max >= range.min
  );
}

function formatDimension(dimension: FitDimension): string {
  return dimension.charAt(0).toUpperCase() + dimension.slice(1);
}

function formatCentimetres(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function calculateDimensionFit(
  dimension: FitDimension,
  userValueCm: number,
  range: FitRange,
): DimensionFitResult {
  const midpoint = (range.min + range.max) / 2;
  const halfRange = Math.max((range.max - range.min) / 2, 1);
  const withinRange =
    userValueCm >= range.min && userValueCm <= range.max;

  let score: number;
  let explanation: string;

  if (withinRange) {
    const distanceFromMiddle = Math.abs(userValueCm - midpoint);
    const distanceRatio = Math.min(distanceFromMiddle / halfRange, 1);

    // A value at the middle receives 100, while a value at the edge
    // of the accepted range receives 90.
    score = Math.round(100 - distanceRatio * 10);
    explanation = `${formatDimension(dimension)} is within the recommended range.`;
  } else {
    const distanceOutside =
      userValueCm < range.min
        ? range.min - userValueCm
        : userValueCm - range.max;

    // Reduce the score transparently for each centimetre outside the range.
    score = Math.max(0, Math.round(90 - distanceOutside * 8));

    const direction = userValueCm < range.min ? "below" : "above";
    explanation = `${formatDimension(dimension)} is ${formatCentimetres(
      distanceOutside,
    )} cm ${direction} the recommended range.`;
  }

  return {
    dimension,
    userValueCm,
    minimumCm: range.min,
    maximumCm: range.max,
    score,
    withinRange,
    explanation,
  };
}

export function scoreVariantFit(
  measurements: UserMeasurements,
  variant: VariantFitInput,
): VariantFitResult {
  const details: DimensionFitResult[] = [];

  for (const dimension of FIT_DIMENSIONS) {
    const userValue = measurements[dimension];
    const range = variant.ranges[dimension];

    if (!isValidMeasurement(userValue) || !isValidRange(range)) {
      continue;
    }

    details.push(calculateDimensionFit(dimension, userValue, range));
  }

  if (details.length === 0) {
    return {
      variantId: variant.variantId,
      size: variant.size,
      fitScore: null,
      comparedDimensions: 0,
      details: [],
    };
  }

  const totalScore = details.reduce(
    (total, detail) => total + detail.score,
    0,
  );

  return {
    variantId: variant.variantId,
    size: variant.size,
    fitScore: Math.round(totalScore / details.length),
    comparedDimensions: details.length,
    details,
  };
}

export function recommendBestSize(
  measurements: UserMeasurements,
  variants: VariantFitInput[],
): SizeRecommendation {
  const scoredVariants = variants
    .map((variant) => scoreVariantFit(measurements, variant))
    .filter(
      (
        result,
      ): result is VariantFitResult & { fitScore: number } =>
        result.fitScore !== null,
    )
    .sort((first, second) => {
      if (second.fitScore !== first.fitScore) {
        return second.fitScore - first.fitScore;
      }

      if (second.comparedDimensions !== first.comparedDimensions) {
        return second.comparedDimensions - first.comparedDimensions;
      }

      return first.variantId.localeCompare(second.variantId);
    });

  const bestMatch = scoredVariants[0];

  if (!bestMatch) {
    return {
      recommendedVariantId: null,
      recommendedSize: null,
      fitScore: null,
      comparedDimensions: 0,
      reasons: [],
    };
  }

  return {
    recommendedVariantId: bestMatch.variantId,
    recommendedSize: bestMatch.size,
    fitScore: bestMatch.fitScore,
    comparedDimensions: bestMatch.comparedDimensions,
    reasons: bestMatch.details.map((detail) => detail.explanation),
  };
}
