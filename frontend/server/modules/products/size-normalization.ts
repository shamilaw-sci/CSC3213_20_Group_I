type MeasurementProfile = {
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
};

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

const womenSizeChart = [
  { size: "XS", chest: 78, waist: 62, hips: 86 },
  { size: "S", chest: 84, waist: 68, hips: 92 },
  { size: "M", chest: 90, waist: 74, hips: 98 },
  { size: "L", chest: 98, waist: 82, hips: 106 },
  { size: "XL", chest: 106, waist: 90, hips: 114 },
  { size: "XXL", chest: 116, waist: 100, hips: 124 },
];

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

export function recommendSize(profile: MeasurementProfile, availableSizes: (string | null | undefined)[]) {
  const normalizedAvailable = sortSizes(availableSizes);
  if (!normalizedAvailable.length) return null;

  const target = {
    chest: profile.chestCm ?? 0,
    waist: profile.waistCm ?? 0,
    hips: profile.hipsCm ?? 0,
  };

  const scored = womenSizeChart
    .filter((entry) => normalizedAvailable.includes(entry.size))
    .map((entry) => ({
      size: entry.size,
      score:
        Math.abs(entry.chest - target.chest) +
        Math.abs(entry.waist - target.waist) +
        Math.abs(entry.hips - target.hips),
    }))
    .sort((left, right) => left.score - right.score);

  return scored[0]?.size ?? normalizedAvailable[0];
}
