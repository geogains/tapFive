import { NextResponse, type NextRequest } from "next/server";
import { validateAndPriceCart, type CartLineInput } from "@/lib/server/orderPricing";
import { getStripePriceId } from "@/lib/server/stripePriceMap";
import { buildCheckoutMetadata, MAX_CHECKOUT_LINES } from "@/lib/server/checkoutMetadata";
import { getStripeClient } from "@/lib/server/stripeClient";

// Stripe's Node SDK needs the Node runtime, not the Edge runtime.
export const runtime = "nodejs";

const SITE_URL_FALLBACK = "https://tapfive.co.uk";

type CheckoutRequestBody = { items?: unknown };

/**
 * Strips a client-supplied cart line down to exactly the fields
 * `validateAndPriceCart` accepts — `slug`, `quantity`, `configuration`.
 * Anything else the browser sends (a price, a line total, a Stripe Price
 * ID) is dropped here rather than merely ignored downstream, so there is
 * no code path that could ever forward a client-asserted price or ID.
 */
function sanitizeCartLine(raw: unknown): CartLineInput | null {
  if (typeof raw !== "object" || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.slug !== "string" || typeof record.quantity !== "number") return null;

  let configuration: Record<string, string> | undefined;
  if (record.configuration && typeof record.configuration === "object") {
    const stringEntries = Object.entries(record.configuration as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    );
    configuration = Object.fromEntries(stringEntries);
  }

  return { slug: record.slug, quantity: record.quantity, configuration };
}

/**
 * Creates a live Stripe Checkout Session for the submitted cart.
 *
 * The browser is only ever trusted to say WHAT (product slug), HOW MANY
 * (quantity) and WITH WHAT CONFIGURATION (Google business / Instagram
 * handle / custom branding) — never the price. Amount charged always
 * comes from `getStripePriceId`, a server-controlled map to live Stripe
 * Price IDs that already have TAP25 and bundle-tier pricing baked in
 * (see `src/lib/server/stripePriceMap.ts`), so TAP25 is applied exactly
 * once, at Stripe price-authoring time — never recomputed here.
 */
export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  if (body.items.length > MAX_CHECKOUT_LINES) {
    return NextResponse.json(
      { error: "Cart has too many distinct items for checkout — please split this into a smaller order." },
      { status: 400 },
    );
  }

  const cartLines: CartLineInput[] = [];
  for (const raw of body.items) {
    const sanitized = sanitizeCartLine(raw);
    if (!sanitized) {
      return NextResponse.json({ error: "Cart contains malformed items." }, { status: 400 });
    }
    cartLines.push(sanitized);
  }

  // Server-side source of truth: re-validates every product slug, clamps
  // quantity to that product's real pricing tiers (1-5 for every product
  // today), and re-validates configuration — never trusts the client's
  // copy of any of this. Its computed pence totals are informational only;
  // the Stripe Price ID below is the sole source of the amount charged.
  const validation = validateAndPriceCart(cartLines);
  if (!validation.valid) {
    return NextResponse.json(
      { error: "Some items in your cart are no longer valid.", details: validation.errors },
      { status: 400 },
    );
  }

  const lineItems: { price: string; quantity: number }[] = [];
  for (const line of validation.lines) {
    const priceId = getStripePriceId(line.slug, line.quantity);
    if (!priceId) {
      return NextResponse.json(
        { error: `No live pricing is configured for "${line.name}" × ${line.quantity}.` },
        { status: 400 },
      );
    }
    // One Stripe line item per bundle, always quantity 1 — the Price ID
    // already represents the whole bundle total (see stripePriceMap.ts).
    // Never `quantity: line.quantity` — bundle pricing is nonlinear.
    lineItems.push({ price: priceId, quantity: 1 });
  }

  const metadataResult = buildCheckoutMetadata(validation.lines);
  if ("error" in metadataResult) {
    return NextResponse.json({ error: metadataResult.error }, { status: 400 });
  }

  const origin = new URL(request.url).origin || SITE_URL_FALLBACK;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      // Separate from TAP25 — these are additional codes created directly
      // in the Stripe Dashboard and stack on top of the already-discounted
      // bundle prices above.
      allow_promotion_codes: true,
      // Tap Five is UK-only today (see src/data/site-content.ts — no
      // evidence of international shipping elsewhere on the site).
      shipping_address_collection: { allowed_countries: ["GB"] },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: metadataResult.metadata,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout Session URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout Session:", error);
    return NextResponse.json(
      { error: "Unable to start checkout right now. Please try again." },
      { status: 502 },
    );
  }
}
