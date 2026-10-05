import type {
  RecommendationScoreInput,
  RecommendationScoreResult,
  RecommendationWeights,
} from "./types";

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  fit: 0.6,
  interest: 0.4,
};

function normalizeScore(
  score: number | null | undefined,
): number | null {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

function normalizeWeights(
  weights: RecommendationWeights,
): RecommendationWeights {
  const fit =
    Number.isFinite(weights.fit) && weights.fit >= 0
      ? weights.fit
      : 0;
  const interest =
    Number.isFinite(weights.interest) && weights.interest >= 0
      ? weights.interest
      : 0;
  const total = fit + interest;

  if (total === 0) {
    return DEFAULT_RECOMMENDATION_WEIGHTS;
  }

  return {
    fit: fit / total,
    interest: interest / total,
  };
}

function uniqueReasons(reasons: string[]): string[] {
  return [
    ...new Set(reasons.filter((reason) => reason.trim() !== "")),
  ];
}

export function combineRecommendationScores(
  input: RecommendationScoreInput,
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
): RecommendationScoreResult {
  const fitScore = normalizeScore(input.fitScore);
  const interestScore = normalizeScore(input.interestScore);

  if (fitScore !== null && interestScore !== null) {
    const normalizedWeights = normalizeWeights(weights);

    return {
      productId: input.productId,
      fitScore,
      interestScore,
      recommendationScore: Math.round(
        fitScore * normalizedWeights.fit +
          interestScore * normalizedWeights.interest,
      ),
      mode: "combined",
      reasons: uniqueReasons([
        ...(input.fitReasons ?? []),
        ...(input.interestReasons ?? []),
      ]),
    };
  }

  if (fitScore !== null) {
    return {
      productId: input.productId,
      fitScore,
      interestScore: null,
      recommendationScore: fitScore,
      mode: "fit",
      reasons: uniqueReasons(input.fitReasons ?? []),
    };
  }

  if (interestScore !== null) {
    return {
      productId: input.productId,
      fitScore: null,
      interestScore,
      recommendationScore: interestScore,
      mode: "interest",
      reasons: uniqueReasons(input.interestReasons ?? []),
    };
  }

  return {
    productId: input.productId,
    fitScore: null,
    interestScore: null,
    recommendationScore: null,
    mode: "general",
    reasons: [],
  };
}

export function rankRecommendations(
  inputs: RecommendationScoreInput[],
  weights: RecommendationWeights = DEFAULT_RECOMMENDATION_WEIGHTS,
): RecommendationScoreResult[] {
  return inputs
    .map((input, originalIndex) => ({
      originalIndex,
      result: combineRecommendationScores(input, weights),
    }))
    .sort((first, second) => {
      const firstScore = first.result.recommendationScore ?? -1;
      const secondScore = second.result.recommendationScore ?? -1;

      if (secondScore !== firstScore) {
        return secondScore - firstScore;
      }

      return first.originalIndex - second.originalIndex;
    })
    .map(({ result }) => result);
}
