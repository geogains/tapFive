/**
 * Multi-buy ("Buy more, save more") pricing tiers.
 *
 * Only the 1-card price is real, confirmed Tap Five pricing. Everything
 * else in this file is a structural placeholder so the product pages can
 * demonstrate the multi-buy UX before commercial pricing is finalised.
 */

// TODO(pricing): these per-quantity discount percentages are TEMPORARY
// placeholder values, chosen only to make the "buy more, save more" UI
// demonstrate a decreasing per-card price. They are NOT approved Tap Five
// commercial pricing. Replace with real figures before launch, then remove
// this TODO.
const TODO_PLACEHOLDER_DISCOUNT_BY_QUANTITY: Record<number, number> = {
  1: 0,
  2: 0.08,
  3: 0.12,
  4: 0.15,
  5: 0.18,
};

// TODO(pricing): which tier(s) carry a merchandising tag, and what the tag
// says, is also undecided. Placeholder assignment for now — configurable
// per product rather than hardcoded into the selector UI.
const DEFAULT_TIER_TAGS: Partial<Record<number, string>> = {
  3: "MOST POPULAR",
  5: "BEST VALUE",
};

export type PricingTier = {
  quantity: number;
  /** Total price for this quantity, in pence. Quantity 1 is real; 2–5 are TODO placeholders (see above). */
  totalPrice: number;
  /** Effective per-card price for this tier, in pence — derived from totalPrice. */
  pricePerCard: number;
  /** Amount saved vs buying this many cards individually at the base single-card price, in pence. */
  savings: number;
  /** Optional merchandising label for this tier, e.g. "MOST POPULAR" or "BEST VALUE". */
  tag?: string;
};

/**
 * Builds the five quantity tiers (1–5 cards) for a product from its real
 * single-card price. Tier 1's total is exact; tiers 2–5 apply the TODO
 * placeholder discount table above and must be replaced before launch.
 *
 * Client-side only — once checkout is connected, the selected tier must be
 * re-validated server-side rather than trusting this calculated total.
 */
export function buildPricingTiers(
  baseSingleCardPrice: number,
  tierTags: Partial<Record<number, string>> = DEFAULT_TIER_TAGS,
): PricingTier[] {
  return [1, 2, 3, 4, 5].map((quantity) => {
    const discount = TODO_PLACEHOLDER_DISCOUNT_BY_QUANTITY[quantity] ?? 0;
    const fullPrice = baseSingleCardPrice * quantity;
    const totalPrice = quantity === 1 ? baseSingleCardPrice : Math.round(fullPrice * (1 - discount));

    return {
      quantity,
      totalPrice,
      pricePerCard: Math.round(totalPrice / quantity),
      savings: fullPrice - totalPrice,
      tag: tierTags[quantity],
    };
  });
}
