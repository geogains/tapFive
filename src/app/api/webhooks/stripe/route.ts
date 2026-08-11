import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/server/stripeClient";
import { markOrderPaidFromWebhook, markOrderPaymentFailedFromWebhook } from "@/lib/server/orders";

// Stripe's Node SDK (and its webhook signature verification) needs the Node runtime.
export const runtime = "nodejs";

/**
 * Verified Stripe webhook receiver. This — not the success page redirect —
 * is the authoritative signal that a payment happened; see
 * `handlePaidCheckoutSession` below and `src/app/checkout/success/page.tsx`.
 *
 * Handles `checkout.session.completed` plus the two async-payment-method
 * follow-up events, per Stripe's own recommendation: some payment methods
 * (e.g. certain bank debits/redirects) can leave a session "completed" while
 * the payment itself is still settling (`payment_status: "unpaid"`), with
 * the real outcome reported later via `async_payment_succeeded` /
 * `async_payment_failed`. Card payments (Tap Five's primary method) settle
 * synchronously, so for those `checkout.session.completed` alone already
 * carries `payment_status: "paid"`.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured — rejecting webhook delivery.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe-Signature header." }, { status: 400 });
  }

  // Signature verification needs the exact raw request bytes — Next.js App
  // Router route handlers don't apply any body parsing before this runs, so
  // `request.text()` is safe to use as-is (do not `request.json()` first).
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        await handlePaidCheckoutSession(session);
      } else {
        console.log(
          `Checkout session ${session.id} completed but payment is still pending (${session.payment_status}) — awaiting async_payment_succeeded/failed.`,
        );
      }
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      await handlePaidCheckoutSession(event.data.object);
      break;
    }

    case "checkout.session.async_payment_failed": {
      await handleFailedCheckoutSession(event.data.object);
      break;
    }

    default:
      // Not subscribed to in the Stripe Dashboard beyond these three, but
      // ignore anything else gracefully rather than erroring.
      break;
  }

  return NextResponse.json({ received: true });
}

/**
 * The single point where a Checkout Session is treated as "money has
 * actually arrived." Marks the corresponding Supabase `orders` row `paid`
 * — see `markOrderPaidFromWebhook` in `src/lib/server/orders.ts` for the
 * idempotency/race-safety guarantees (duplicate deliveries no-op, `paid_at`
 * is never rewritten, concurrent deliveries can't double-apply).
 *
 * The order is located via `session.metadata.order_id` — the Supabase
 * order UUID set at Checkout Session creation time (see
 * `src/app/api/checkout/route.ts` / `buildCheckoutMetadata`) — rather than
 * `orders.stripe_checkout_session_id`, so this still works even if the
 * (best-effort, non-fatal) write of that column back onto the order failed
 * at creation time; `markOrderPaidFromWebhook` backfills it here.
 */
async function handlePaidCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    // Only expected for a session Tap Five's own checkout route didn't
    // create (e.g. a Stripe Dashboard test session) — nothing to persist,
    // but logged loudly since for a real order this would be a bug.
    console.error("Stripe checkout completed but session has no metadata.order_id — cannot mark any order paid:", session.id);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const result = await markOrderPaidFromWebhook({
    orderId,
    sessionId: session.id,
    paymentIntentId,
    customerEmail: session.customer_details?.email ?? null,
    customerName: session.customer_details?.name ?? null,
    // Stripe's own final charged amount — includes any additional Stripe
    // promotion code applied at Checkout on top of the TAP25-adjusted
    // Price IDs. Validated inside markOrderPaidFromWebhook before use.
    amountTotal: session.amount_total,
  });

  if (!result.ok) {
    console.error("Failed to mark order paid from webhook:", orderId, "session:", session.id, "reason:", result.reason);
    return;
  }

  console.log(
    result.alreadyPaid
      ? `Order ${orderId} was already paid — duplicate webhook delivery ignored.`
      : `Order ${orderId} marked paid (session ${session.id}, amount ${session.amount_total} ${session.currency}).`,
  );
}

/** Mirrors `handlePaidCheckoutSession` for the `async_payment_failed` case — see `markOrderPaymentFailedFromWebhook` for why this can never downgrade an already-paid order. */
async function handleFailedCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("Stripe checkout async payment failed but session has no metadata.order_id:", session.id);
    return;
  }

  const result = await markOrderPaymentFailedFromWebhook({ orderId, sessionId: session.id });

  if (!result.ok) {
    console.error("Failed to mark order payment_failed from webhook:", orderId, "session:", session.id);
    return;
  }

  console.log(
    result.skipped
      ? `Order ${orderId} was not in 'pending' status — payment_failed webhook ignored (already paid or already terminal).`
      : `Order ${orderId} marked payment_failed (session ${session.id}).`,
  );
}
