import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your Tap Five cart.",
};

export default function CartPage() {
  return (
    <div>
      <PageHero eyebrow="Cart" heading="Your Cart" />

      <section className="bg-tf-white tf-section">
        <Container>
          <CartPageContent />
        </Container>
      </section>
    </div>
  );
}
