import type {
  InterestCandidate,
  InterestScoreResult,
  InterestSignal,
  InterestSignalType,
} from "./types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const INTEREST_SIGNAL_WEIGHTS: Record<
  InterestSignalType,
  number
> = {
  FAVORITE: 4,
  TRY_ON: 4,
  COMPARISON: 3,
  REDIRECT: 2,
};

function getRecencyFactor(occurredAt: Date, now: Date): number {
  const timestamp = occurredAt.getTime();

  if (!Number.isFinite(timestamp)) {
    return 0.5;
  }

  const ageInMilliseconds = Math.max(0, now.getTime() - timestamp);
  const ageInDays = ageInMilliseconds / MILLISECONDS_PER_DAY;

  if (ageInDays <= 30) {
    return 1;
  }

  if (ageInDays <= 90) {
    return 0.75;
  }

  return 0.5;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function hasMatchingColor(
  candidateColors: string[],
  signalColor: string,
): boolean {
  const normalizedSignalColor = normalizeText(signalColor);

  return candidateColors.some(
    (color) => normalizeText(color) === normalizedSignalColor,
  );
}

export function scoreProductInterest(
  candidate: InterestCandidate,
  signals: InterestSignal[],
  now: Date = new Date(),
): InterestScoreResult {
  let weightedMatches = 0;
  let weightedPossible = 0;
  let matchedSignals = 0;

  let categoryMatches = 0;
  let merchantMatches = 0;
  let colorMatches = 0;

  const candidateColors = candidate.colors ?? [];

  for (const signal of signals) {
    let comparableAttributes = 0;
    let matchingAttributes = 0;

    if (
      candidate.categoryId != null &&
      signal.categoryId != null
    ) {
      comparableAttributes += 1;

      if (candidate.categoryId === signal.categoryId) {
        matchingAttributes += 1;
        categoryMatches += 1;
      }
    }

    if (
      candidate.merchantId != null &&
      signal.merchantId != null
    ) {
      comparableAttributes += 1;

      if (candidate.merchantId === signal.merchantId) {
        matchingAttributes += 1;
        merchantMatches += 1;
      }
    }

    if (candidateColors.length > 0 && signal.color) {
      comparableAttributes += 1;

      if (hasMatchingColor(candidateColors, signal.color)) {
        matchingAttributes += 1;
        colorMatches += 1;
      }
    }

    if (comparableAttributes === 0) {
      continue;
    }

    const actionWeight = INTEREST_SIGNAL_WEIGHTS[signal.type];
    const recencyFactor = getRecencyFactor(signal.occurredAt, now);
    const weightedSignal = actionWeight * recencyFactor;

    weightedPossible += weightedSignal;
    weightedMatches +=
      weightedSignal *
      (matchingAttributes / comparableAttributes);

    if (matchingAttributes > 0) {
      matchedSignals += 1;
    }
  }

  if (weightedPossible === 0) {
    return {
      productId: candidate.productId,
      interestScore: null,
      matchedSignals: 0,
      reasons: [],
    };
  }

  const reasons: string[] = [];

  if (categoryMatches > 0) {
    reasons.push(
      "Matches categories from your recent activity.",
    );
  }

  if (merchantMatches > 0) {
    reasons.push(
      "Matches brands or merchants you interacted with.",
    );
  }

  if (colorMatches > 0) {
    reasons.push(
      "Matches colours from products you interacted with.",
    );
  }

  return {
    productId: candidate.productId,
    interestScore: Math.round(
      (weightedMatches / weightedPossible) * 100,
    ),
    matchedSignals,
    reasons,
  };
}