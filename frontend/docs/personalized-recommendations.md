# Personalized Product Recommendations

## Overview

This feature recommends products using:

1. The user's saved body measurements.
2. The user's existing product interaction history.

The fit score is only a project-level compatibility estimate. It is not
a medical, scientific, or guaranteed clothing-fit measurement.

## Fit personalization

The fit scorer compares these Profile measurements:

- Chest
- Waist
- Hips
- Shoulder

with the measurement ranges supplied for each ProductVariant.

Only measurements available on both sides are compared. Missing
measurements are ignored.

The highest-scoring available variant becomes the recommended size.

## ProductVariant metadata format

Product size ranges should be stored inside the existing
`ProductVariant.metadata` JSON field.

Example:

```json
{
  "fitRangesCm": {
    "chest": { "min": 86, "max": 92 },
    "waist": { "min": 70, "max": 76 },
    "hips": { "min": 90, "max": 98 },
    "shoulder": { "min": 38, "max": 42 }
  }
}
```

Not every dimension is required.

The metadata parser ignores:

- Missing metadata
- Negative values
- Reversed minimum and maximum values
- Text instead of numbers
- Unsupported dimensions
- Unrelated JSON properties

No new Product or ProductVariant table is required.

## Interest personalization

The current API loads two kinds of existing application records:

- Favorites
- Merchant redirects

Their interaction weights are:

| Interaction | Weight |
|---|---:|
| Favorite | 4 |
| Merchant redirect | 2 |

Recent interactions receive more influence than older interactions.

The live signals are compared with products using:

- Category
- Merchant or brand

The scoring module also supports Try-On, comparison, and colour signals,
but the current API does not load those interactions or a colour from
favorites and redirects. They must not be presented as active sources of
personalization yet.

Search and product-view history are not included in the first version
because dedicated search/view records do not currently exist.

## Combined recommendation score

Default scoring weights:

- Fit compatibility: 60%
- Interest relevance: 40%

Fallback behavior:

| Available data | Recommendation mode |
|---|---|
| Fit and interest | 60% fit and 40% interest |
| Fit only | 100% fit |
| Interest only | 100% interest |
| Neither | General product feed |

Missing information is not treated as zero.

## Recommendation output

A recommendation may contain:

- Product ID
- Recommended variant ID
- Recommended size
- Fit score
- Interest score
- Final recommendation score
- Personalization mode
- Explainable reasons

## Privacy

The recommendation API must not return:

- Raw body measurements
- Digital Twin image paths
- Encryption information
- Complete interaction history
- Other private Profile information

## Domain ownership

### S/21/063

- Fit scoring
- Interest scoring
- Combined recommendation engine
- Measurement integration
- Recommendation API
- Recommended For You interface
- Recommendation tests

### S/21/501

- Product and ProductVariant data
- Product and merchant APIs
- Catalogue and product details
- Variant metadata population
- Product synchronization

### S/21/490

- Try-On API
- Try-On action
- Try-On result processing

## Current implementation status

Completed:

- Fit scoring
- Recommended-size selection
- Interest scoring
- Combined 60/40 recommendation score
- Missing-data fallback behavior
- Product metadata validation
- Unit and API tests
- Queries for saved Profile measurements and a ready Digital Twin snapshot
- Queries for active catalogue products and in-stock variants
- Favorites and merchant redirects as interest signals
- Authenticated `GET /api/v1/recommendations` API
- Recommended For You page with Product Details and Try-On actions

The Product Details and Try-On actions are connected in the interface;
their full end-to-end behavior still needs manual testing with a signed-in
customer and available catalogue data. A recommended size is only shown
when the product variant has usable `fitRangesCm` metadata.
