import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { getStripeClient } from "@/lib/server/stripeClient";
import { ClearCartOnSuccess } from "@/components/checkout/ClearCartOnSuccess";

export const metadata: Metadata = {
  title: "Order received",
  description: "Your Tap Five order has been received.",
};

type SearchParams = { session_id?: string };

/**
 * Reached via the Checkout Session's `success_url`. This retrieves the
 * session purely to show a friendlier confirmation (amount, email) — it is
 * NOT how a payment is confirmed. A customer can reach this URL without
 * having paid (a closed tab reopened, a bookmarked link, a retrieval
 * failure below), so `isPaid` only ever affects wording here. The Stripe
 * webhook (`/api/webhooks/stripe`) is the sole authoritative source for
 * "this order was actually paid."
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { session_id: sessionId } = await searchParams;
  const session = sessionId ? await safelyRetrieveSession(sessionId) : null;
  const isPaid = session?.payment_status === "paid" || session?.payment_status === "no_payment_required";

  return (
    <div>
      <ClearCartOnSuccess paid={isPaid} />

      <PageHero
        eyebrow="Checkout"
        heading={isPaid ? "Payment received" : "Order received"}
        supporting={
          isPaid
            ? "Thank you — your Tap Five order has been received and your payment was successful."
            : "Thank you — we're confirming your payment now. This can take a moment for some payment methods."
        }
      />

      <section className="bg-tf-white tf-section">
        <Container className="flex flex-col items-start gap-8">
          <div className="flex flex-col gap-2 text-sm text-tf-neutral-600">
            {session?.amount_total != null ? (
              <p>
                Amount paid:{" "}
                <span className="font-semibold text-tf-black">{formatPrice(session.amount_total)}</span>
              </p>
            ) : null}
            {session?.customer_details?.email ? (
              <p>
                A confirmation has been sent to{" "}
                <span className="font-medium text-tf-black">{session.customer_details.email}</span>.
              </p>
            ) : (
              <p>You&apos;ll receive a confirmation email shortly.</p>
            )}
            {sessionId ? <p className="text-xs text-tf-neutral-400">Reference: {sessionId}</p> : null}
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-tf-neutral-600">
            We&apos;ll configure your card(s) with the details you provided and get your order ready for
            dispatch. If we need anything else from you, we&apos;ll be in touch by email.
          </p>

          <Button href="/products" className="bg-tf-black text-tf-white hover:bg-tf-neutral-800">
            Continue shopping
          </Button>
        </Container>
      </section>
    </div>
  );
}

async function safelyRetrieveSession(sessionId: string) {
  try {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("Failed to retrieve Stripe Checkout Session for the success page:", error);
    return null;
  }
}
