"use client";

import { useCallback, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";

/**
 * Shared by `CartDrawer` and `CartPageContent` (the cart's two surfaces
 * already share `CartLineItem` the same way) so there is one checkout call
 * site, not two copies that could drift.
 *
 * Sends only `slug` / `quantity` / `configuration` per line — deliberately
 * never the cart's displayed `price` / `lineTotal` / `normalPrice`. The
 * server (`/api/checkout`) re-derives the authoritative price from its own
 * Stripe Price ID map; nothing the browser computed is ever trusted as an
 * amount to charge.
 */
export function useCartCheckout() {
  const { items } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    if (isSubmitting || items.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
            configuration: item.configuration,
          })),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || typeof data?.url !== "string") {
        setError(data?.error ?? "Unable to start checkout right now. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Full navigation to Stripe's hosted page — not a client-side route,
      // so `isSubmitting` deliberately stays true while the browser leaves.
      window.location.assign(data.url);
    } catch {
      setError("Unable to start checkout right now. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  }, [items, isSubmitting]);

  return { startCheckout, isSubmitting, error };
}
