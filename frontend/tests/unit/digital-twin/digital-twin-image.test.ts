import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  DigitalTwinImageError,
  processDigitalTwinImage,
} from "../../../server/images/digital-twin-image";

describe("processDigitalTwinImage", () => {
  it("rejects corrupted image data", async () => {
    const corruptedImage = Buffer.from("not a real image");

    await expect(
      processDigitalTwinImage(corruptedImage),
    ).rejects.toBeInstanceOf(DigitalTwinImageError);
  });

  it("rejects images below the minimum dimensions", async () => {
    const smallImage = await sharp({
      create: {
        width: 200,
        height: 300,
        channels: 3,
        background: "#6d5dfc",
      },
    })
      .jpeg()
      .toBuffer();

    await expect(
      processDigitalTwinImage(smallImage),
    ).rejects.toThrow("at least 400 × 600 pixels");
  });

  it("resizes, re-encodes and removes EXIF metadata", async () => {
    const sourceImage = await sharp({
      create: {
        width: 2000,
        height: 3000,
        channels: 3,
        background: "#6d5dfc",
      },
    })
      .jpeg()
      .withExif({
        IFD0: {
          Artist: "Private test metadata",
        },
      })
      .toBuffer();

    const processed = await processDigitalTwinImage(sourceImage);
    const metadata = await sharp(processed.buffer).metadata();

    expect(processed.contentType).toBe("image/jpeg");
    expect(processed.width).toBe(1600);
    expect(processed.height).toBe(2400);
    expect(processed.size).toBe(processed.buffer.length);
    expect(metadata.format).toBe("jpeg");
    expect(metadata.exif).toBeUndefined();
  });
});