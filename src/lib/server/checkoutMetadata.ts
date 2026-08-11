import type { ValidatedOrderLine } from "@/lib/server/orderPricing";

/** Stripe's own limits on a Checkout Session's `metadata` object. */
const MAX_METADATA_KEYS = 50;
const MAX_METADATA_VALUE_LENGTH = 500;
const MAX_METADATA_KEY_LENGTH = 40;

/** Generous but bounded — no legitimate Tap Five order needs more distinct lines than this; guards against a crafted request trying to blow past Stripe's metadata limits. */
export const MAX_CHECKOUT_LINES = 20;

/**
 * Packs the order's product/quantity/configuration into the Checkout
 * Session's `metadata` — the only channel available (there is no order
 * database wired up yet, see `supabase/migrations/`) to recover what was
 * actually purchased and how each card should be configured once Stripe
 * reports a payment via webhook.
 *
 * Deliberately does NOT include price/amount — that's already on the
 * Session itself (`amount_total`, line items) and must never be sourced
 * from anywhere else.
 *
 * Per-field keys (`cfg_<line index>_<field>`) rather than one JSON blob
 * per line: `ValidatedOrderLine.configuration` values are already capped
 * at 500 characters each by `validateOrderConfiguration`, matching
 * Stripe's own per-value cap exactly — a combined JSON blob for a line
 * with several near-maximum-length fields could exceed that cap, while
 * each field on its own never can.
 */
export function buildCheckoutMetadata(
  lines: ValidatedOrderLine[],
): { metadata: Record<string, string> } | { error: string } {
  const metadata: Record<string, string> = {
    tap5_pricing_note: "TAP25 (25%) and bundle-tier discounts are already included in each line's price.",
    tap5_order_lines: lines.map((line) => `${line.slug}:${line.quantity}`).join(","),
  };

  lines.forEach((line, index) => {
    for (const [field, value] of Object.entries(line.configuration)) {
      metadata[`cfg_${index}_${field}`] = value;
    }
  });

  for (const [key, value] of Object.entries(metadata)) {
    if (key.length > MAX_METADATA_KEY_LENGTH || value.length > MAX_METADATA_VALUE_LENGTH) {
      return { error: "Order details are too large to process. Please contact us instead." };
    }
  }

  if (Object.keys(metadata).length > MAX_METADATA_KEYS) {
    return { error: "Cart has too many distinct items for checkout — please split this into a smaller order." };
  }

  return { metadata };
}
