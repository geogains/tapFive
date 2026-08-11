import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  description: "Your Tap Five checkout was cancelled.",
};

/**
 * Reached via the Checkout Session's `cancel_url`. Nothing about the
 * checkout flow ever clears the cart's `localStorage` state, so simply
 * returning here is enough to "preserve" it — there is nothing to recover.
 */
export default function CheckoutCancelPage() {
  return (
    <div>
      <PageHero
        eyebrow="Checkout"
        heading="Checkout cancelled"
        supporting="No payment was taken. Your cart has been saved, so you can pick up right where you left off."
      />

      <section className="bg-tf-white tf-section">
        <Container>
          <Button href="/cart" className="bg-tf-black text-tf-white hover:bg-tf-neutral-800">
            Return to cart
          </Button>
        </Container>
      </section>
    </div>
  );
}
