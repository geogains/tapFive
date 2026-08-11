import { products } from "@/data/products";
import { validateOrderConfiguration } from "@/lib/server/orderConfiguration";
import { calculatePromotionalPrice, PROMOTION } from "@/data/promotion";

export type CartLineInput = {
  slug: string;
  quantity: number;
  configuration?: Record<string, string>;
};

export type ValidatedOrderLine = {
  slug: string;
  name: string;
  quantity: number;
  /** Pence, pre-discount. */
  unitPrice: number;
  /** Pence, pre-discount — the selected tier's exact total. */
  lineTotal: number;
  /** Pence, per-unit price with TAP25 applied. */
  discountedUnitPrice: number;
  /** Pence, `lineTotal` with TAP25 applied — the authoritative amount this line is charged. */
  discountedLineTotal: number;
  configuration: Record<string, string>;
};

export type OrderLineError = { slug: string; message: string };

export type OrderValidationResult =
  | {
      valid: true;
      lines: ValidatedOrderLine[];
      /** Pence, pre-discount — sum of every line's `lineTotal`. */
      subtotal: number;
      /** Pence — total TAP25 saving across the order. Zero when the promotion is inactive. */
      discountTotal: number;
      /** Pence — the amount to actually charge. Sum of every line's `discountedLineTotal`. */
      total: number;
      /** `null` when the promotion is inactive, otherwise the promotion that was applied. */
      promotion: { code: string; discountPercent: number } | null;
    }
  | { valid: false; errors: OrderLineError[] };

/**
 * The server-side source of truth for "what does this cart actually cost,
 * and is it well-formed" — recomputes every line from the same canonical
 * `products` / `pricingTiers` data the client UI already reads from (see
 * `src/data/products.ts`, `src/data/pricing.ts`), then applies the same
 * TAP25 promotion (`src/data/promotion.ts`) the client cart applies, in the
 * same order: quantity → tier → normal price → TAP25 → final price. There
 * is only ever one pricing table and one discount rule, not a client copy
 * and a server copy that can drift apart. Also re-validates each line's
 * configuration via `validateOrderConfiguration`.
 *
 * Not wired to any route yet. This is what the future checkout endpoint
 * should call with the client's cart contents before creating a Supabase
 * order or a Stripe Checkout Session — a cart item's client-submitted
 * `price` / `lineTotal` / subtotal (see `CartItem` in `CartProvider.tsx`)
 * must never be trusted directly, including any TAP25-discounted figure the
 * browser displays; only `slug`, `quantity` and `configuration` should ever
 * cross the wire from the client, and even those are re-validated here
 * rather than assumed correct. `discountedLineTotal` / `total` here are
 * what should actually be sent to Stripe as the line/order amount.
 */
export function validateAndPriceCart(lines: CartLineInput[]): OrderValidationResult {
  const errors: OrderLineError[] = [];
  const validated: ValidatedOrderLine[] = [];

  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) {
      errors.push({ slug: line.slug, message: "Unknown product." });
      continue;
    }

    const maxQuantity = product.pricingTiers.at(-1)?.quantity ?? 1;
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > maxQuantity) {
      errors.push({
        slug: line.slug,
        message: `Quantity must be a whole number between 1 and ${maxQuantity}.`,
      });
      continue;
    }

    const tier = product.pricingTiers.find((t) => t.quantity === line.quantity);
    if (!tier) {
      errors.push({ slug: line.slug, message: "No pricing tier is defined for this quantity." });
      continue;
    }

    const configResult = validateOrderConfiguration(product.configurationType, line.configuration);
    if (!configResult.valid) {
      errors.push({ slug: line.slug, message: configResult.message });
      continue;
    }

    validated.push({
      slug: product.slug,
      name: product.name,
      quantity: line.quantity,
      unitPrice: tier.pricePerCard,
      lineTotal: tier.totalPrice,
      discountedUnitPrice: calculatePromotionalPrice(tier.pricePerCard),
      discountedLineTotal: calculatePromotionalPrice(tier.totalPrice),
      configuration: configResult.configuration,
    });
  }

  if (errors.length > 0) return { valid: false, errors };

  const subtotal = validated.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = validated.reduce((sum, line) => sum + line.discountedLineTotal, 0);

  return {
    valid: true,
    lines: validated,
    subtotal,
    discountTotal: subtotal - total,
    total,
    promotion: PROMOTION.active ? { code: PROMOTION.code, discountPercent: PROMOTION.discountPercent } : null,
  };
}
