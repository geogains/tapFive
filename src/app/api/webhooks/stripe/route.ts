import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/server/stripeClient";

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
        handlePaidCheckoutSession(session);
      } else {
        console.log(
          `Checkout session ${session.id} completed but payment is still pending (${session.payment_status}) — awaiting async_payment_succeeded/failed.`,
        );
      }
      break;
    }

    case "checkout.session.async_payment_succeeded": {
      handlePaidCheckoutSession(event.data.object);
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      console.warn(`Checkout session ${session.id} payment failed (async payment method).`);
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
 * actually arrived." Not yet wired to persistence — there is no order
 * database connected yet (see
 * `supabase/migrations/20260810120000_create_orders_schema.sql` for the
 * schema this is designed to fill in as the next step). For now this logs
 * everything needed to manually fulfil the order.
 *
 * IMPORTANT — idempotency: Stripe documents "at least once" webhook
 * delivery, so this can run more than once for the same session (retries,
 * duplicate deliveries). Right now that only repeats a log line, which is
 * harmless. It stops being harmless the moment this function gains a real
 * side effect (sending a confirmation email, decrementing stock, writing an
 * order row). At that point, check `session.id` against
 * `orders.stripe_checkout_session_id` (the unique column already exists in
 * the schema above) before acting, so a retried delivery updates the same
 * row instead of duplicating fulfilment.
 */
function handlePaidCheckoutSession(session: Stripe.Checkout.Session) {
  const shipping = session.collected_information?.shipping_details;

  console.log("Stripe checkout paid:", {
    sessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    amountTotal: session.amount_total,
    currency: session.currency,
    customerEmail: session.customer_details?.email,
    customerName: session.customer_details?.name,
    customerPhone: session.customer_details?.phone,
    shippingName: shipping?.name,
    shippingAddress: shipping?.address,
    orderLines: session.metadata?.tap5_order_lines,
    metadata: session.metadata,
  });
}
