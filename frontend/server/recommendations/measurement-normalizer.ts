import {
  FIT_DIMENSIONS,
  type FitDimension,
  type UserMeasurements,
} from "./types";

const PROFILE_MEASUREMENT_KEYS: Record<FitDimension, string> = {
  chest: "chestCm",
  waist: "waistCm",
  hips: "hipsCm",
  shoulder: "shoulderCm",
};

const SNAPSHOT_MEASUREMENT_KEYS: Record<FitDimension, string> = {
  chest: "chest",
  waist: "waist",
  hips: "hips",
  shoulder: "shoulder",
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  if (isRecord(value) && typeof value.toString === "function") {
    return parsePositiveNumber(value.toString());
  }

  return null;
}

function normalizeMeasurements(
  value: unknown,
  keys: Record<FitDimension, string>,
): UserMeasurements {
  if (!isRecord(value)) {
    return {};
  }

  const measurements: UserMeasurements = {};

  for (const dimension of FIT_DIMENSIONS) {
    const measurement = parsePositiveNumber(value[keys[dimension]]);

    if (measurement !== null) {
      measurements[dimension] = measurement;
    }
  }

  return measurements;
}

export function normalizeProfileMeasurements(
  measurement: unknown,
): UserMeasurements {
  return normalizeMeasurements(
    measurement,
    PROFILE_MEASUREMENT_KEYS,
  );
}

export function normalizeDigitalTwinSnapshot(
  snapshot: unknown,
): UserMeasurements {
  return normalizeMeasurements(
    snapshot,
    SNAPSHOT_MEASUREMENT_KEYS,
  );
}

export function resolveUserMeasurements(
  profileMeasurement: unknown,
  digitalTwinSnapshot: unknown,
): UserMeasurements {
  const currentMeasurements =
    normalizeProfileMeasurements(profileMeasurement);
  const snapshotMeasurements =
    normalizeDigitalTwinSnapshot(digitalTwinSnapshot);
  const resolved: UserMeasurements = {};

  for (const dimension of FIT_DIMENSIONS) {
    const value =
      currentMeasurements[dimension] ??
      snapshotMeasurements[dimension];

    if (value !== undefined && value !== null) {
      resolved[dimension] = value;
    }
  }

  return resolved;
}
