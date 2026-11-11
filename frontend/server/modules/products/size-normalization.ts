import { z } from "zod";

type MeasurementProfile = {
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  shoulderCm?: number | null;
};

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

const bodyRangeSchema = z.object({
  min: z.number().min(0).max(300),
  max: z.number().min(0).max(300),
}).refine((value) => value.max >= value.min, "Fit range max must be greater than min.");

export const fitRangesCmSchema = z.object({
  chest: bodyRangeSchema.optional(),
  waist: bodyRangeSchema.optional(),
  hips: bodyRangeSchema.optional(),
  shoulder: bodyRangeSchema.optional(),
}).refine((value) => Boolean(value.chest || value.waist || value.hips || value.shoulder), "At least one fit range is required.");

export type FitRangesCm = z.infer<typeof fitRangesCmSchema>;

export function normalizeSizeLabel(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  const aliases: Record<string, string> = {
    EXTRASMALL: "XS",
    SMALL: "S",
    MEDIUM: "M",
    LARGE: "L",
    EXTRALARGE: "XL",
    "2XL": "XXL",
  };
  return aliases[normalized] ?? normalized;
}

export function sortSizes(sizes: (string | null | undefined)[]) {
  return [...new Set(sizes.map(normalizeSizeLabel).filter(Boolean) as string[])].sort((left, right) => {
    const leftIndex = sizeOrder.indexOf(left);
    const rightIndex = sizeOrder.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}

function isInRange(value: number | null | undefined, range: { min: number; max: number } | undefined) {
  if (!range || value == null) return true;
  return value >= range.min && value <= range.max;
}

function rangeDistance(value: number | null | undefined, range: { min: number; max: number } | undefined) {
  if (!range || value == null) return 0;
  if (value < range.min) return range.min - value;
  if (value > range.max) return value - range.max;
  return 0;
}

export function recommendSizeFromFitRanges(
  profile: MeasurementProfile,
  variants: { size: string | null | undefined; fitRangesCm?: FitRangesCm | null }[],
) {
  const candidates = variants
    .map((variant) => ({ size: normalizeSizeLabel(variant.size), fitRangesCm: variant.fitRangesCm }))
    .filter((variant): variant is { size: string; fitRangesCm: FitRangesCm } => Boolean(variant.size && variant.fitRangesCm));

  if (!candidates.length) {
    return { recommendedSize: null, confidence: "unavailable" as const, reason: "No merchant fit ranges are available for this product." };
  }

  const exact = candidates.find((candidate) => (
    isInRange(profile.chestCm, candidate.fitRangesCm.chest) &&
    isInRange(profile.waistCm, candidate.fitRangesCm.waist) &&
    isInRange(profile.hipsCm, candidate.fitRangesCm.hips) &&
    isInRange(profile.shoulderCm, candidate.fitRangesCm.shoulder)
  ));

  if (exact) {
    return { recommendedSize: exact.size, confidence: "fit_range_match" as const, reason: "Matched against merchant-provided fit ranges." };
  }

  const closest = candidates
    .map((candidate) => ({
      size: candidate.size,
      distance:
        rangeDistance(profile.chestCm, candidate.fitRangesCm.chest) +
        rangeDistance(profile.waistCm, candidate.fitRangesCm.waist) +
        rangeDistance(profile.hipsCm, candidate.fitRangesCm.hips) +
        rangeDistance(profile.shoulderCm, candidate.fitRangesCm.shoulder),
    }))
    .sort((left, right) => left.distance - right.distance)[0];

  return {
    recommendedSize: closest?.size ?? null,
    confidence: "closest_fit_range" as const,
    reason: "Closest available size based on merchant-provided fit ranges.",
  };
}
