import { products } from "@/data/products";
import { calculatePromotionalPrice } from "@/data/promotion";

type StripePriceMapping = {
  priceId: string;
  /** The bundle's final price in pence, as supplied alongside the live Price ID — used only to self-check against the catalogue below, never sent to Stripe. */
  expectedPence: number;
};

/**
 * Central, server-only map from (product slug, quantity) to the live
 * Stripe Price ID for that exact bundle. This is the only place a Stripe
 * Price ID is allowed to live — nothing else in the codebase should
 * reference one directly, and nothing derived from client input maps to a
 * Price ID without going through `getStripePriceId` below.
 *
 * Each Price ID represents the ENTIRE bundle for that quantity (already
 * TAP25-discounted, already bundle-tier-discounted) as ONE Stripe line
 * item at quantity 1 — never the per-card price multiplied by quantity.
 * These are LIVE prices; they are not secrets (Stripe Price IDs are safe
 * to read from server-side source), but the underlying charge they
 * authorise is real money, hence `assertStripePriceMapMatchesCatalog`
 * below.
 *
 * Keyed by `Product.slug` from `src/data/products.ts` (not `routeSlug`).
 */
export const STRIPE_PRICE_MAP: Record<string, Record<number, StripePriceMapping>> = {
  // Google Review Card — £30.00 / £55.20 / £79.20 / £102.00 / £123.00
  "counter-review-card": {
    1: { priceId: "price_1U3EbaPDQ6npU2uNOtqXW98R", expectedPence: 3000 },
    2: { priceId: "price_1U3EdwPDQ6npU2uN5rSFfJok", expectedPence: 5520 },
    3: { priceId: "price_1U3EeaPDQ6npU2uNEgUn6xlP", expectedPence: 7920 },
    4: { priceId: "price_1U3EfEPDQ6npU2uNTpFfO7z0", expectedPence: 10200 },
    5: { priceId: "price_1U3EfXPDQ6npU2uNM4BE82oX", expectedPence: 12300 },
  },
  // Instagram Follow Card — £30.00 / £55.20 / £79.20 / £102.00 / £123.00
  "review-stand": {
    1: { priceId: "price_1U3EhIPDQ6npU2uN8gCoVKHP", expectedPence: 3000 },
    2: { priceId: "price_1U3Ei7PDQ6npU2uN3j2V8qMe", expectedPence: 5520 },
    3: { priceId: "price_1U3EiUPDQ6npU2uNuTMlbTP9", expectedPence: 7920 },
    4: { priceId: "price_1U3EisPDQ6npU2uNO9tZz3kg", expectedPence: 10200 },
    5: { priceId: "price_1U3Ej5PDQ6npU2uNkZhTM8cL", expectedPence: 12300 },
  },
  // Custom Branded Card — £52.50 / £96.60 / £138.60 / £178.50 / £215.25
  "custom-branded-card": {
    1: { priceId: "price_1U3ElSPDQ6npU2uNz94dhrkk", expectedPence: 5250 },
    2: { priceId: "price_1U3EmBPDQ6npU2uN4rOz3W2r", expectedPence: 9660 },
    3: { priceId: "price_1U3EmfPDQ6npU2uNShrzjQAu", expectedPence: 13860 },
    4: { priceId: "price_1U3EmwPDQ6npU2uNrpCb31NF", expectedPence: 17850 },
    5: { priceId: "price_1U3EnEPDQ6npU2uN3bgkZF6S", expectedPence: 21525 },
  },
};

/** Only these quantities are ever valid for checkout — mirrors the 5 tiers `buildPricingTiers` defines. */
export const MIN_CHECKOUT_QUANTITY = 1;
export const MAX_CHECKOUT_QUANTITY = 5;

/**
 * Looks up the live Stripe Price ID for a product+quantity bundle.
 * Returns `undefined` for anything not explicitly mapped — callers must
 * treat that as a rejected line, never fall back to computing a price.
 */
export function getStripePriceId(productSlug: string, quantity: number): string | undefined {
  return STRIPE_PRICE_MAP[productSlug]?.[quantity]?.priceId;
}

/**
 * Fails loudly at module load (build, dev boot, and every serverless cold
 * start) if `STRIPE_PRICE_MAP`'s `expectedPence` and the site's own
 * catalogue pricing (`src/data/products.ts` tiers + TAP25 in
 * `src/data/promotion.ts`) ever disagree. The live Price IDs above were
 * supplied as the pre-computed final TAP25+bundle price for each tier;
 * this recomputes that same figure independently from the site's own
 * pricing logic and asserts they match in pence, so a future catalogue
 * price change — or a mistyped `expectedPence` — surfaces immediately
 * instead of silently charging customers a different amount than the
 * site displays.
 */
function assertStripePriceMapMatchesCatalog(): void {
  for (const product of products) {
    const tierMappings = STRIPE_PRICE_MAP[product.slug];
    if (!tierMappings) continue;

    for (const [quantityKey, mapping] of Object.entries(tierMappings)) {
      const quantity = Number(quantityKey);
      const tier = product.pricingTiers.find((t) => t.quantity === quantity);
      if (!tier) {
        throw new Error(
          `Stripe price map error: "${product.slug}" has a mapped quantity of ${quantity} but no matching pricing tier exists in src/data/products.ts.`,
        );
      }

      const catalogPence = calculatePromotionalPrice(tier.totalPrice);
      if (catalogPence !== mapping.expectedPence) {
        throw new Error(
          `Stripe price map mismatch for "${product.slug}" × ${quantity}: catalogue (tier total + TAP25) computes ${catalogPence}p, but ${mapping.priceId} is recorded as ${mapping.expectedPence}p. Fix src/data/products.ts, src/data/promotion.ts, or this map before deploying — the two must agree.`,
        );
      }
    }
  }
}

assertStripePriceMapMatchesCatalog();
