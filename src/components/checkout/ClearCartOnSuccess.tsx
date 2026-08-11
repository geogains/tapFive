"use client";

import { useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";

/**
 * The smallest client boundary needed to react to a payment outcome the
 * server has already established. `paid` is computed server-side in
 * `src/app/checkout/success/page.tsx` from Stripe's own Checkout Session
 * (`payment_status`) — this component makes no payment-status decision of
 * its own; it only tidies up the browser's cart display once told to.
 *
 * This is a convenience for the customer, not a source of truth: clearing
 * (or not clearing) the cart is never treated as evidence of payment
 * anywhere else in the app. The Stripe webhook + Supabase `orders` row
 * remain the sole authority for whether an order was actually paid — see
 * `src/app/api/webhooks/stripe/route.ts`.
 *
 * Renders nothing. `clearCart()` is safe to call repeatedly (a page
 * refresh re-runs this effect against an already-empty cart), and itself
 * writes through to `localStorage` immediately rather than waiting on
 * `CartProvider`'s hydration effect — see the comment on `clearCart` in
 * `CartProvider.tsx` for why that ordering matters here specifically.
 */
export function ClearCartOnSuccess({ paid }: { paid: boolean }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (paid) clearCart();
  }, [paid, clearCart]);

  return null;
}
