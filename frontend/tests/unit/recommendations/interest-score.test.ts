import { describe, expect, it } from "vitest";

import { scoreProductInterest } from "../../../server/recommendations/interest-score";
import type {
  InterestCandidate,
  InterestSignal,
} from "../../../server/recommendations/types";

const NOW = new Date("2026-09-24T10:00:00.000Z");

const candidate: InterestCandidate = {
  productId: 25,
  categoryId: 3,
  merchantId: 7,
  colors: ["Black", "Blue"],
};

describe("recommendation interest scoring", () => {
  it("returns no score when interaction history is missing", () => {
    const result = scoreProductInterest(candidate, [], NOW);

    expect(result).toEqual({
      productId: 25,
      interestScore: null,
      matchedSignals: 0,
      reasons: [],
    });
  });

  it("gives a full score when category, merchant and colour match", () => {
    const signals: InterestSignal[] = [
      {
        type: "FAVORITE",
        categoryId: 3,
        merchantId: 7,
        color: "black",
        occurredAt: new Date("2026-09-20T10:00:00.000Z"),
      },
    ];

    const result = scoreProductInterest(candidate, signals, NOW);

    expect(result.interestScore).toBe(100);
    expect(result.matchedSignals).toBe(1);
    expect(result.reasons).toContain(
      "Matches categories from your recent activity.",
    );
    expect(result.reasons).toContain(
      "Matches brands or merchants you interacted with.",
    );
    expect(result.reasons).toContain(
      "Matches colours from products you interacted with.",
    );
  });

  it("returns zero when comparable preferences do not match", () => {
    const signals: InterestSignal[] = [
      {
        type: "TRY_ON",
        categoryId: 9,
        merchantId: 12,
        color: "red",
        occurredAt: new Date("2026-09-23T10:00:00.000Z"),
      },
    ];

    const result = scoreProductInterest(candidate, signals, NOW);

    expect(result.interestScore).toBe(0);
    expect(result.matchedSignals).toBe(0);
    expect(result.reasons).toEqual([]);
  });

  it("weights favorite history more strongly than a redirect", () => {
    const signals: InterestSignal[] = [
      {
        type: "FAVORITE",
        categoryId: 3,
        occurredAt: new Date("2026-09-23T10:00:00.000Z"),
      },
      {
        type: "REDIRECT",
        categoryId: 9,
        occurredAt: new Date("2026-09-23T10:00:00.000Z"),
      },
    ];

    const result = scoreProductInterest(candidate, signals, NOW);

    expect(result.interestScore).toBe(67);
    expect(result.matchedSignals).toBe(1);
  });

  it("matches colours without case sensitivity", () => {
    const signals: InterestSignal[] = [
      {
        type: "COMPARISON",
        color: "  BLUE ",
        occurredAt: new Date("2026-09-10T10:00:00.000Z"),
      },
    ];

    const result = scoreProductInterest(candidate, signals, NOW);

    expect(result.interestScore).toBe(100);
    expect(result.reasons).toContain(
      "Matches colours from products you interacted with.",
    );
  });

  it("reduces the influence of older interactions", () => {
    const signals: InterestSignal[] = [
      {
        type: "FAVORITE",
        categoryId: 3,
        occurredAt: new Date("2026-04-01T10:00:00.000Z"),
      },
      {
        type: "FAVORITE",
        categoryId: 9,
        occurredAt: new Date("2026-09-23T10:00:00.000Z"),
      },
    ];

    const result = scoreProductInterest(candidate, signals, NOW);

    expect(result.interestScore).toBe(33);
    expect(result.matchedSignals).toBe(1);
  });

  it("returns no score when signals have no comparable attributes", () => {
    const signals: InterestSignal[] = [
      {
        type: "REDIRECT",
        occurredAt: new Date("2026-09-23T10:00:00.000Z"),
      },
    ];

    const result = scoreProductInterest(candidate, signals, NOW);

    expect(result.interestScore).toBeNull();
    expect(result.matchedSignals).toBe(0);
    expect(result.reasons).toEqual([]);
  });
});