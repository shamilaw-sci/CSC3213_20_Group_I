import { describe, expect, it } from "vitest";

import {
  CROP_RATIO,
  getCropOutputSize,
  getCropRect,
  getMaxCropZoom,
  MAX_CROP_ZOOM,
  MIN_CROP_HEIGHT,
  MIN_CROP_WIDTH,
} from "../../../features/profile/utils/digitalTwinCrop";

describe("Digital Twin crop geometry", () => {
  it("uses the largest 2:3 area of a portrait image", () => {
    expect(CROP_RATIO).toBe(2 / 3);
    expect(getCropRect(1200, 1800, 1, 0.5, 0.5)).toEqual({
      x: 0,
      y: 0,
      width: 1200,
      height: 1800,
    });
  });

  it("centres the largest 2:3 area of a landscape image", () => {
    expect(getCropRect(1800, 1200, 1, 0.5, 0.5)).toEqual({
      x: 500,
      y: 0,
      width: 800,
      height: 1200,
    });
  });

  it("pans to each edge without leaving the source image", () => {
    const leftTop = getCropRect(1800, 1200, 2, 0, 0);
    const rightBottom = getCropRect(1800, 1200, 2, 1, 1);

    expect(leftTop).toEqual({ x: 0, y: 0, width: 400, height: 600 });
    expect(rightBottom).toEqual({ x: 1400, y: 600, width: 400, height: 600 });
    expect(getCropRect(1800, 1200, 2, -1, 2)).toEqual({
      ...leftTop,
      y: rightBottom.y,
    });
  });

  it("limits zoom so the crop remains at least 400 × 600", () => {
    expect(getMaxCropZoom(1200, 1800)).toBe(MAX_CROP_ZOOM);
    expect(getMaxCropZoom(800, 1200)).toBe(2);
    expect(getMaxCropZoom(400, 600)).toBe(1);
    expect(getCropRect(800, 1200, 99, 0.5, 0.5)).toEqual({
      x: 200,
      y: 300,
      width: MIN_CROP_WIDTH,
      height: MIN_CROP_HEIGHT,
    });
  });

  it("rejects a source too small for a valid portrait crop", () => {
    expect(() => getMaxCropZoom(399, 600)).toThrow(RangeError);
    expect(() => getCropRect(1000, 599, 1, 0.5, 0.5)).toThrow(RangeError);
    expect(() => getCropRect(Number.NaN, 1000, 1, 0.5, 0.5)).toThrow(RangeError);
  });

  it("keeps output exactly 2:3, caps it, and never upscales", () => {
    expect(getCropOutputSize(400)).toEqual({ width: 400, height: 600 });
    expect(getCropOutputSize(999)).toEqual({ width: 998, height: 1497 });
    expect(getCropOutputSize(2400)).toEqual({ width: 1600, height: 2400 });
    expect(() => getCropOutputSize(399)).toThrow(RangeError);
  });
});
