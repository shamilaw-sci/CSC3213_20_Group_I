import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  lookup: vi.fn(),
}));

vi.mock("node:dns/promises", () => ({
  lookup: mocks.lookup,
}));

import { assertPublicHttpUrl, fetchJsonWithLimits } from "../../../server/security/safe-fetch";

describe("safe merchant feed fetch", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
  });

  it("blocks non-http and private network destinations", async () => {
    await expect(assertPublicHttpUrl("file:///etc/passwd")).rejects.toThrow("URL must use HTTP or HTTPS.");

    mocks.lookup.mockResolvedValueOnce([{ address: "127.0.0.1", family: 4 }]);
    await expect(assertPublicHttpUrl("https://localhost.example.test/feed.json")).rejects.toThrow("URL host is not allowed.");

    mocks.lookup.mockResolvedValueOnce([{ address: "10.0.0.5", family: 4 }]);
    await expect(assertPublicHttpUrl("https://internal.example.test/feed.json")).rejects.toThrow("URL host is not allowed.");
  });

  it("rejects oversized JSON responses", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("{\"products\":[]}"));
          controller.close();
        },
      }),
    }) as unknown as typeof fetch;

    await expect(fetchJsonWithLimits("https://merchant.example.test/feed.json", { maxBytes: 4 })).rejects.toThrow("Remote response is too large.");
  });
});
