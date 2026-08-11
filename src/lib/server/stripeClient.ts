import Stripe from "stripe";

/**
 * Server-only Stripe SDK singleton. Never import this from a Client
 * Component — `STRIPE_SECRET_KEY` must never reach the browser bundle.
 *
 * Lazily constructed (not instantiated at module load) so that importing
 * this file — which happens as soon as Next.js collects route data for
 * `src/app/api/checkout` / `src/app/api/webhooks/stripe` at build time —
 * does not itself require `STRIPE_SECRET_KEY` to be present. The key is
 * only required once a request actually needs to talk to Stripe.
 */
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it as a server-side environment variable (never NEXT_PUBLIC_) before checkout can run.",
    );
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}
