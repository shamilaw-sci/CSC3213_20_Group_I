/** WBS-2.3 | Owner: S/21/063 | Branch: feature/s21-063-profile-digital-twin | Rule-based profile size recommendation. */
export type RecommendedSize = "XS" | "S" | "M" | "L" | "XL";
type Range = { min: number; max: number };
type SizeChart = Record<RecommendedSize, { chest: Range; waist: Range; hips: Range }>;

export const sizeChart: SizeChart = {
  XS: { chest: { min: 80, max: 86 }, waist: { min: 64, max: 70 }, hips: { min: 84, max: 90 } },
  S: { chest: { min: 87, max: 92 }, waist: { min: 71, max: 76 }, hips: { min: 91, max: 96 } },
  M: { chest: { min: 93, max: 98 }, waist: { min: 77, max: 82 }, hips: { min: 97, max: 102 } },
  L: { chest: { min: 99, max: 104 }, waist: { min: 83, max: 88 }, hips: { min: 103, max: 108 } },
  XL: { chest: { min: 105, max: 112 }, waist: { min: 89, max: 96 }, hips: { min: 109, max: 116 } },
};

const within = (value: number, range: Range) => value >= range.min && value <= range.max;
const distance = (value: number, range: Range) => within(value, range) ? 0 : Math.min(Math.abs(value - range.min), Math.abs(value - range.max));

export function recommendSize(measurements: { height: number; chest: number; waist: number; hips: number }) {
  if (!Number.isFinite(measurements.height) || measurements.height < 100 || measurements.height > 250) return { error: "Height must be between 100 and 250 cm." } as const;
  if ([measurements.chest, measurements.waist, measurements.hips].some((value) => !Number.isFinite(value) || value <= 0)) return { error: "Chest, waist, and hip measurements must be positive numbers." } as const;
  const ranked = (Object.keys(sizeChart) as RecommendedSize[]).map((size) => {
    const chart = sizeChart[size]; const matches = { chest: within(measurements.chest, chart.chest), waist: within(measurements.waist, chart.waist), hips: within(measurements.hips, chart.hips) };
    return { size, matches, matchCount: Object.values(matches).filter(Boolean).length, distance: distance(measurements.chest, chart.chest) + distance(measurements.waist, chart.waist) + distance(measurements.hips, chart.hips) };
  }).sort((a, b) => b.matchCount - a.matchCount || a.distance - b.distance);
  const best = ranked[0];
  return { ...best, confidence: best.matchCount === 3 ? 91 : best.matchCount === 2 ? 74 : best.matchCount === 1 ? 55 : 35 } as const;
}
