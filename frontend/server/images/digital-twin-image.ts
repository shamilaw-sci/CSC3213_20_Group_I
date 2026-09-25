import "server-only";

import sharp from "sharp";

const MIN_WIDTH = 400;
const MIN_HEIGHT = 600;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_OUTPUT_WIDTH = 1600;
const MAX_OUTPUT_HEIGHT = 2400;

const SUPPORTED_FORMATS = new Set(["jpeg", "png"]);

export class DigitalTwinImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DigitalTwinImageError";
  }
}

export type ProcessedDigitalTwinImage = {
  buffer: Buffer;
  contentType: "image/jpeg";
  width: number;
  height: number;
  size: number;
};

export async function processDigitalTwinImage(
  input: Buffer,
): Promise<ProcessedDigitalTwinImage> {
  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).metadata();
  } catch {
    throw new DigitalTwinImageError(
      "The uploaded file is corrupted or is not a valid image.",
    );
  }

  if (
    !metadata.format ||
    !SUPPORTED_FORMATS.has(metadata.format) ||
    !metadata.width ||
    !metadata.height
  ) {
    throw new DigitalTwinImageError(
      "Only valid PNG and JPEG images are supported.",
    );
  }

  if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
    throw new DigitalTwinImageError(
      `Image dimensions must be at least ${MIN_WIDTH} × ${MIN_HEIGHT} pixels.`,
    );
  }

  if (metadata.pages && metadata.pages > 1) {
    throw new DigitalTwinImageError("Animated images are not supported.");
  }

  try {
    const { data, info } = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_INPUT_PIXELS,
    })
      .rotate()
      .flatten({ background: "#ffffff" })
      .resize({
        width: MAX_OUTPUT_WIDTH,
        height: MAX_OUTPUT_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        mozjpeg: true,
      })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      contentType: "image/jpeg",
      width: info.width,
      height: info.height,
      size: info.size,
    };
  } catch {
    throw new DigitalTwinImageError(
      "The image could not be securely processed.",
    );
  }
}
