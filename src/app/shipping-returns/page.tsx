import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { LegalContent } from "@/components/ui/LegalContent";
import { legalPages } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping timescales and returns information for Tap Five orders.",
};

export default function ShippingReturnsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Legal"
        heading={legalPages.shipping.heading}
        supporting={legalPages.shipping.updated}
      />
      <LegalContent>
        <h2>Placeholder content</h2>
        <p>
          This page is a placeholder for Tap Five&apos;s shipping and returns policy. Replace this
          content with real dispatch timescales, delivery areas and return conditions before
          launch.
        </p>
        <h2>Shipping</h2>
        <p>
          Add detail here on production and dispatch timescales once your review link has been
          confirmed, delivery areas covered, and any shipping costs.
        </p>
        <h2>Returns</h2>
        <p>
          Because cards are configured to an individual business&apos;s review link, describe any
          conditions that apply to returns or exchanges, particularly for custom-branded orders.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about an order can be directed to the contact details listed on the{" "}
          <a href="/contact">Contact</a> page.
        </p>
      </LegalContent>
    </div>
  );
}
