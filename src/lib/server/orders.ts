import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/server/supabaseClient";
import type { OrderValidationResult } from "@/lib/server/orderPricing";

export type OrderStatus = "pending" | "paid" | "payment_failed" | "cancelled" | "fulfilled";

/**
 * `getSupabaseAdminClient()` throws if `SUPABASE_URL`/`SUPABASE_SECRET_KEY`
 * are missing — appropriate for "fail clearly", but every function below
 * needs to turn that into a handled result rather than an uncaught
 * exception (an uncaught throw inside a route handler produces an opaque
 * empty 500, not the clean `{error: "..."}` response the rest of this API
 * returns). The thrown message never contains a secret value, only which
 * env vars are missing, so logging it as-is is safe.
 */
function tryGetSupabaseAdminClient(context: string): SupabaseClient | null {
  try {
    return getSupabaseAdminClient();
  } catch (error) {
    console.error(`Supabase is not available (${context}):`, error instanceof Error ? error.message : error);
    return null;
  }
}

type ValidCartResult = Extract<OrderValidationResult, { valid: true }>;

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: "order_insert_failed" | "items_insert_failed" };

/**
 * Creates the pending `orders` row plus its `order_items`, from server
 * validated/priced data ONLY (`validateAndPriceCart`'s output) — never
 * from anything the client sent directly. This must run, and succeed,
 * before a Stripe Checkout Session is created: we must not charge a
 * customer for an order we failed to persist.
 *
 * `order_items.unit_price` / `line_total` store the TAP25-discounted,
 * pre-Checkout catalogue figures (`discountedUnitPrice` /
 * `discountedLineTotal`) — a fixed snapshot of what the catalogue/TAP25
 * math produced for this cart, never rewritten after this point. Summing
 * `order_items.line_total` reconciles with `orders.total` only until the
 * order is paid with no additional Stripe promotion code; once paid,
 * `orders.total` is overwritten with Stripe's own final `amount_total`
 * (see `markOrderPaidFromWebhook`), which can be lower still if an extra
 * promo code was applied at Checkout. `order_items` intentionally does
 * NOT get rewritten to match — it stays a true catalogue/TAP25 snapshot,
 * and the extra promo code's saving is an order-level Stripe discount,
 * not something to distribute back across line items.
 *
 * If the parent order is created but its items fail to insert, the order
 * is deliberately deleted again: a parent row with zero items can't be
 * fulfilled or reconciled against anything, so it isn't useful "evidence"
 * the way a pending-with-no-Stripe-session row is (see
 * `attachStripeSessionId`) — it's a partial write, not an audit trail. If
 * that cleanup delete itself fails, the broken row is left in place and
 * logged loudly rather than causing a second silent failure.
 */
export async function createPendingOrder(validation: ValidCartResult): Promise<CreateOrderResult> {
  const supabase = tryGetSupabaseAdminClient("createPendingOrder");
  if (!supabase) return { ok: false, reason: "order_insert_failed" };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "pending" satisfies OrderStatus,
      currency: "gbp",
      subtotal: validation.subtotal,
      total: validation.total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Failed to create Supabase order:", orderError?.message);
    return { ok: false, reason: "order_insert_failed" };
  }

  const itemRows = validation.lines.map((line) => ({
    order_id: order.id as string,
    product_slug: line.slug,
    product_name: line.name,
    quantity: line.quantity,
    unit_price: line.discountedUnitPrice,
    line_total: line.discountedLineTotal,
    configuration: line.configuration,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);

  if (itemsError) {
    console.error("Failed to create Supabase order_items for order", order.id, itemsError.message);

    const { error: cleanupError } = await supabase.from("orders").delete().eq("id", order.id);
    if (cleanupError) {
      console.error(
        "Also failed to clean up the now-orphaned pending order (created with no items) — left in place for manual review:",
        order.id,
        cleanupError.message,
      );
    }

    return { ok: false, reason: "items_insert_failed" };
  }

  return { ok: true, orderId: order.id as string };
}

/**
 * Best-effort link from the Supabase order back to the Stripe Checkout
 * Session that was created for it. Deliberately non-fatal: the order's id
 * is already embedded in the session's own `metadata.order_id` (set at
 * creation time, in Stripe's hands from that point on regardless of what
 * happens to this write), so the webhook can always find and pay the order
 * even if this particular update fails — and the webhook re-sets this same
 * column itself when it marks the order paid, self-healing the gap. Logged
 * loudly so a persistent failure here is still visible operationally.
 */
export async function attachStripeSessionId(orderId: string, sessionId: string): Promise<void> {
  const supabase = tryGetSupabaseAdminClient("attachStripeSessionId");
  if (!supabase) return;

  const { error } = await supabase
    .from("orders")
    .update({ stripe_checkout_session_id: sessionId, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error(
      "Failed to attach Stripe Checkout Session id to order (non-fatal — the webhook will self-heal this when it marks the order paid):",
      orderId,
      sessionId,
      error.message,
    );
  }
}

type MarkPaidParams = {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  /**
   * The Checkout Session's own `amount_total` (pence) — the trusted,
   * Stripe-computed amount actually charged, INCLUDING any additional
   * Stripe promotion code applied at Checkout on top of the already-TAP25
   * -adjusted Price IDs (see `stripePriceMap.ts`). This becomes
   * `orders.total` on the pending→paid transition below, overwriting the
   * pre-promo-code estimate `createPendingOrder` wrote at order-creation
   * time — that estimate is the best figure available before Checkout,
   * but only Stripe knows the final amount once any extra promo code has
   * been applied, so this is the only trustworthy source for `total` once
   * an order is `paid`. Never sourced from the browser.
   */
  amountTotal: number | null;
};

export type MarkPaidResult =
  | { ok: true; alreadyPaid: boolean }
  | {
      ok: false;
      reason: "order_not_found" | "session_mismatch" | "unexpected_status" | "invalid_amount_total" | "update_failed";
    };

/**
 * The ONLY place an order transitions to `paid` — called exclusively from
 * the verified Stripe webhook (`checkout.session.completed` with a settled
 * `payment_status`, or `checkout.session.async_payment_succeeded`), never
 * from the success-page redirect.
 *
 * Idempotent under Stripe's "at least once" webhook delivery: if the order
 * is already `paid`, this is a pure no-op (no rewritten `paid_at`, no
 * rewritten `total`, no duplicate side effects). The final
 * `UPDATE ... WHERE status = 'pending'` is also safe under two concurrent
 * deliveries racing each other — Postgres serializes the two writes to the
 * same row, so whichever commits first flips the status and the second's
 * `WHERE` no longer matches.
 *
 * INVARIANT: once `status = 'paid'`, `orders.total` always equals the
 * Checkout Session's `amount_total` at the moment it was paid — never a
 * value computed from the cart/catalogue. `subtotal` is deliberately left
 * untouched here (see `createPendingOrder`, which sets it from
 * `validation.subtotal` — the pre-TAP25 catalogue/list price) — it is
 * expected to diverge from `total` even with no extra promo code at all
 * (TAP25 alone already makes them differ), and diverges further still
 * whenever an additional Stripe promotion code was used at Checkout.
 */
export async function markOrderPaidFromWebhook(params: MarkPaidParams): Promise<MarkPaidResult> {
  const supabase = tryGetSupabaseAdminClient("markOrderPaidFromWebhook");
  if (!supabase) return { ok: false, reason: "update_failed" };

  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, stripe_checkout_session_id")
    .eq("id", params.orderId)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to look up order for webhook fulfilment:", params.orderId, fetchError.message);
    return { ok: false, reason: "update_failed" };
  }
  if (!existing) {
    console.error(
      "Stripe webhook referenced an order_id with no matching Supabase order — cannot mark paid:",
      params.orderId,
      "session:",
      params.sessionId,
    );
    return { ok: false, reason: "order_not_found" };
  }
  if (existing.stripe_checkout_session_id && existing.stripe_checkout_session_id !== params.sessionId) {
    console.error(
      "Order/session mismatch — order",
      params.orderId,
      "is already linked to session",
      existing.stripe_checkout_session_id,
      "but the webhook reported session",
      params.sessionId,
      "— refusing to update.",
    );
    return { ok: false, reason: "session_mismatch" };
  }
  if (existing.status === "paid") {
    return { ok: true, alreadyPaid: true };
  }
  if (existing.status !== "pending") {
    console.warn(
      "Order",
      params.orderId,
      "received a paid webhook while in unexpected status",
      existing.status,
      "— refusing to overwrite; investigate manually.",
    );
    return { ok: false, reason: "unexpected_status" };
  }
  if (
    params.amountTotal === null ||
    !Number.isInteger(params.amountTotal) ||
    params.amountTotal < 0
  ) {
    // Refuse to mark the order paid at all rather than write an untrustworthy
    // total — a Checkout Session that's genuinely paid always has a definite,
    // non-negative integer `amount_total`; anything else indicates something
    // is wrong and must not silently become this order's authoritative total.
    console.error(
      "Refusing to mark order paid — Stripe session reported an invalid amount_total:",
      params.orderId,
      "session:",
      params.sessionId,
      "amount_total:",
      params.amountTotal,
    );
    return { ok: false, reason: "invalid_amount_total" };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid" satisfies OrderStatus,
      stripe_checkout_session_id: params.sessionId,
      stripe_payment_intent_id: params.paymentIntentId,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      // Trusted, Stripe-computed final amount — see the `amountTotal` field
      // doc above for why this (not the pre-Checkout estimate) is what
      // `orders.total` must hold once `status = 'paid'`.
      total: params.amountTotal,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.orderId)
    .eq("status", "pending"); // atomic guard: a concurrent duplicate delivery loses this race harmlessly.

  if (updateError) {
    console.error("Failed to mark order paid:", params.orderId, updateError.message);
    return { ok: false, reason: "update_failed" };
  }

  return { ok: true, alreadyPaid: false };
}

export type MarkFailedResult = { ok: true; skipped: boolean } | { ok: false; reason: "update_failed" };

/**
 * Marks an order `payment_failed` — called from
 * `checkout.session.async_payment_failed`. The `WHERE status = 'pending'`
 * guard means this can never downgrade an order that's already `paid` (or
 * already `payment_failed`/anything else): an out-of-order or duplicate
 * failure event simply matches zero rows and no-ops.
 */
export async function markOrderPaymentFailedFromWebhook(params: {
  orderId: string;
  sessionId: string;
}): Promise<MarkFailedResult> {
  const supabase = tryGetSupabaseAdminClient("markOrderPaymentFailedFromWebhook");
  if (!supabase) return { ok: false, reason: "update_failed" };

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "payment_failed" satisfies OrderStatus, updated_at: new Date().toISOString() })
    .eq("id", params.orderId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to mark order payment_failed:",
      params.orderId,
      "session:",
      params.sessionId,
      error.message,
    );
    return { ok: false, reason: "update_failed" };
  }

  return { ok: true, skipped: !data };
}
