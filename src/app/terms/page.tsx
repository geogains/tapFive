import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { LegalContent } from "@/components/ui/LegalContent";
import { legalPages } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions for using the Tap Five website and ordering products.",
};

export default function TermsPage() {
  return (
    <div>
      <PageHero eyebrow="Legal" heading={legalPages.terms.heading} supporting={legalPages.terms.updated} />
      <LegalContent>
        <h2>Placeholder content</h2>
        <p>
          This page is a placeholder for Tap Five&apos;s terms and conditions. Replace this
          content with the full terms governing use of the website and any orders placed before
          launch.
        </p>
        <h2>Use of this website</h2>
        <p>
          Add detail here on acceptable use of the website, intellectual property, and any
          restrictions that apply to visitors.
        </p>
        <h2>Orders and payment</h2>
        <p>
          Once checkout is introduced, describe how orders are placed, confirmed and paid for,
          including any relevant pricing or availability terms.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be directed to the contact details listed on the{" "}
          <a href="/contact">Contact</a> page.
        </p>
      </LegalContent>
    </div>
  );
}
