/**
 * Site-wide automatic promotional discount.
 *
 * "TAP25" is not a coupon a customer enters — it's the name/code we
 * communicate for a discount that is already applied to every eligible
 * cart line. This is the single place that defines the promotion, so
 * ending or changing it later (rate, active flag, code) is a one-line
 * edit here rather than a hunt through cart components.
 *
 * Both the client cart (`CartProvider`) and the server-side canonical
 * pricing (`src/lib/server/orderPricing.ts`) derive discounted prices
 * through the helpers below, from the same normal price/tier total —
 * never from each other's output — so the browser's displayed price and
 * the future Stripe-authoritative price are always reproducible from the
 * same rule.
 */
export const PROMOTION = {
  code: "TAP25",
  discountPercent: 25,
  active: true,
} as const;

/**
 * Applies the active promotion to a normal amount in pence, rounding to
 * the nearest penny. Returns the amount unchanged if the promotion is
 * inactive, so turning `PROMOTION.active` off later fully restores
 * normal pricing everywhere without touching call sites.
 */
export function calculatePromotionalPrice(normalAmountMinorUnits: number): number {
  if (!PROMOTION.active) return normalAmountMinorUnits;
  const multiplier = (100 - PROMOTION.discountPercent) / 100;
  return Math.round(normalAmountMinorUnits * multiplier);
}

/**
 * The saving (in pence) the promotion produces on a normal amount.
 * Derived as normal minus the already-rounded discounted price — never
 * rounded independently — so `normal - discount` always equals
 * `calculatePromotionalPrice(normal)` exactly, with no penny drift
 * between a displayed "was/now" pair and its "you saved" figure.
 */
export function calculatePromotionalDiscount(normalAmountMinorUnits: number): number {
  return normalAmountMinorUnits - calculatePromotionalPrice(normalAmountMinorUnits);
}
