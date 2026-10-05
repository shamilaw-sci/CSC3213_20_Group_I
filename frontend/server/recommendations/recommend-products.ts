import { recommendBestSize } from "./fit-score";
import { scoreProductInterest } from "./interest-score";
import { parseVariantFitRanges } from "./product-fit-metadata";
import {
  combineRecommendationScores,
  DEFAULT_RECOMMENDATION_WEIGHTS,
} from "./recommendation-engine";
import type {
  InterestSignal,
  ProductRecommendation,
  RecommendationProductCandidate,
  RecommendProductsOptions,
  UserMeasurements,
} from "./types";

function collectProductColors(
  product: RecommendationProductCandidate,
): string[] {
  const colors = product.variants.flatMap((variant) => {
    if (
      typeof variant.color !== "string" ||
      variant.color.trim() === ""
    ) {
      return [];
    }

    return [variant.color.trim()];
  });

  return [...new Set(colors)];
}

export function recommendProducts(
  measurements: UserMeasurements,
  products: RecommendationProductCandidate[],
  interestSignals: InterestSignal[],
  options: RecommendProductsOptions = {},
): ProductRecommendation[] {
  const weights =
    options.weights ?? DEFAULT_RECOMMENDATION_WEIGHTS;

  return products
    .map((product, originalIndex) => {
      const fitResult = recommendBestSize(
        measurements,
        product.variants.map((variant) => ({
          variantId: variant.variantId,
          size: variant.size,
          ranges: parseVariantFitRanges(variant.metadata),
        })),
      );

      const interestResult = scoreProductInterest(
        {
          productId: product.productId,
          categoryId: product.categoryId,
          merchantId: product.merchantId,
          colors: collectProductColors(product),
        },
        interestSignals,
        options.now,
      );

      const combinedResult = combineRecommendationScores(
        {
          productId: product.productId,
          fitScore: fitResult.fitScore,
          interestScore: interestResult.interestScore,
          fitReasons: fitResult.reasons,
          interestReasons: interestResult.reasons,
        },
        weights,
      );

      return {
        originalIndex,
        recommendation: {
          productId: product.productId,
          recommendedVariantId:
            fitResult.recommendedVariantId,
          recommendedSize: fitResult.recommendedSize,
          fitScore: combinedResult.fitScore,
          interestScore: combinedResult.interestScore,
          recommendationScore:
            combinedResult.recommendationScore,
          comparedDimensions: fitResult.comparedDimensions,
          mode: combinedResult.mode,
          reasons: combinedResult.reasons,
        } satisfies ProductRecommendation,
      };
    })
    .sort((first, second) => {
      const firstScore =
        first.recommendation.recommendationScore ?? -1;
      const secondScore =
        second.recommendation.recommendationScore ?? -1;

      if (secondScore !== firstScore) {
        return secondScore - firstScore;
      }

      return first.originalIndex - second.originalIndex;
    })
    .map(({ recommendation }) => recommendation);
}