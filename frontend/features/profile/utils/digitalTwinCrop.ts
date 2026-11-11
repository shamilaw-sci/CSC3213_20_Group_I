export const CROP_RATIO = 2 / 3;
export const MIN_CROP_WIDTH = 400;
export const MIN_CROP_HEIGHT = 600;
export const MAX_CROP_ZOOM = 3;

// Pixel-aligned crops use two horizontal pixels for every three vertical pixels.
const MIN_CROP_UNITS = MIN_CROP_WIDTH / 2;
const MAX_OUTPUT_UNITS = 1600 / 2;

function getLargestCropUnits(sourceWidth: number, sourceHeight: number): number {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0
  ) {
    throw new RangeError("Image dimensions must be positive, finite numbers.");
  }

  const units = Math.floor(Math.min(sourceWidth / 2, sourceHeight / 3));
  if (units < MIN_CROP_UNITS) {
    throw new RangeError("Image must support a crop of at least 400 × 600 pixels.");
  }

  return units;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getMaxCropZoom(sourceWidth: number, sourceHeight: number): number {
  const units = getLargestCropUnits(sourceWidth, sourceHeight);
  return Math.min(MAX_CROP_ZOOM, units / MIN_CROP_UNITS);
}

export function getCropRect(
  sourceWidth: number,
  sourceHeight: number,
  zoom: number,
  positionX: number,
  positionY: number,
): { x: number; y: number; width: number; height: number } {
  const largestUnits = getLargestCropUnits(sourceWidth, sourceHeight);
  const maxZoom = Math.min(MAX_CROP_ZOOM, largestUnits / MIN_CROP_UNITS);
  const safeZoom = Number.isFinite(zoom) ? clamp(zoom, 1, maxZoom) : 1;
  const units = Math.max(MIN_CROP_UNITS, Math.floor(largestUnits / safeZoom));
  const width = units * 2;
  const height = units * 3;
  const x = Math.round(
    (sourceWidth - width) *
      (Number.isFinite(positionX) ? clamp(positionX, 0, 1) : 0.5),
  );
  const y = Math.round(
    (sourceHeight - height) *
      (Number.isFinite(positionY) ? clamp(positionY, 0, 1) : 0.5),
  );

  return { x, y, width, height };
}

export function getCropOutputSize(cropWidth: number): {
  width: number;
  height: number;
} {
  if (!Number.isFinite(cropWidth) || cropWidth < MIN_CROP_WIDTH) {
    throw new RangeError("Crop width must be at least 400 pixels.");
  }

  const units = Math.floor(Math.min(cropWidth / 2, MAX_OUTPUT_UNITS));
  return { width: units * 2, height: units * 3 };
}
