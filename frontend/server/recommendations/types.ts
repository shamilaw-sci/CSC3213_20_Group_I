export const FIT_DIMENSIONS = [
  "chest",
  "waist",
  "hips",
  "shoulder",
] as const;

export type FitDimension = (typeof FIT_DIMENSIONS)[number];

export type UserMeasurements = Partial<
  Record<FitDimension, number | null>
>;

export interface FitRange {
  min: number;
  max: number;
}

export type VariantFitRanges = Partial<
  Record<FitDimension, FitRange>
>;

export interface VariantFitInput {
  variantId: number;
  size: string | null;
  ranges: VariantFitRanges;
}

export interface DimensionFitResult {
  dimension: FitDimension;
  userValueCm: number;
  minimumCm: number;
  maximumCm: number;
  score: number;
  withinRange: boolean;
  explanation: string;
}

export interface VariantFitResult {
  variantId: number;
  size: string | null;
  fitScore: number | null;
  comparedDimensions: number;
  details: DimensionFitResult[];
}

export interface SizeRecommendation {
  recommendedVariantId: number | null;
  recommendedSize: string | null;
  fitScore: number | null;
  comparedDimensions: number;
  reasons: string[];
}