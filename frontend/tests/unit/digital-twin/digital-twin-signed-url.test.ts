import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("server-only", () => ({}));

import {
  createSignedDigitalTwinImageUrl,
  verifySignedDigitalTwinImageUrl,
} from "../../../server/storage/digital-twin-signed-url";

const TEST_TIME = Date.UTC(2026, 8, 12, 10, 0, 0);
const TEST_SECRET =
  "test-only-digital-twin-signing-secret-123456789";

describe("Digital Twin signed image URLs", () => {
  beforeEach(() => {
    vi.stubEnv(
      "DIGITAL_TWIN_URL_SIGNING_SECRET",
      TEST_SECRET,
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates a valid URL for the correct user", () => {
    const imageUrl = createSignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      now: TEST_TIME,
    });

    const parsedUrl = new URL(
      imageUrl,
      "http://localhost",
    );

    const valid = verifySignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      expires: parsedUrl.searchParams.get("expires"),
      signature:
        parsedUrl.searchParams.get("signature"),
      now: TEST_TIME,
    });

    expect(parsedUrl.pathname).toBe(
      "/api/v1/digital-twins/twin-123/image",
    );
    expect(valid).toBe(true);
  });

  it("rejects a URL used by another user", () => {
    const imageUrl = createSignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      now: TEST_TIME,
    });

    const parsedUrl = new URL(
      imageUrl,
      "http://localhost",
    );

    const valid = verifySignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "different-user",
      expires: parsedUrl.searchParams.get("expires"),
      signature:
        parsedUrl.searchParams.get("signature"),
      now: TEST_TIME,
    });

    expect(valid).toBe(false);
  });

  it("rejects an expired URL", () => {
    const imageUrl = createSignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      ttlSeconds: 60,
      now: TEST_TIME,
    });

    const parsedUrl = new URL(
      imageUrl,
      "http://localhost",
    );

    const valid = verifySignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      expires: parsedUrl.searchParams.get("expires"),
      signature:
        parsedUrl.searchParams.get("signature"),
      now: TEST_TIME + 61_000,
    });

    expect(valid).toBe(false);
  });

  it("rejects a modified signature", () => {
    const imageUrl = createSignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      now: TEST_TIME,
    });

    const parsedUrl = new URL(
      imageUrl,
      "http://localhost",
    );

    const valid = verifySignedDigitalTwinImageUrl({
      digitalTwinId: "twin-123",
      userId: "user-123",
      expires: parsedUrl.searchParams.get("expires"),
      signature: "0".repeat(64),
      now: TEST_TIME,
    });

    expect(valid).toBe(false);
  });
});