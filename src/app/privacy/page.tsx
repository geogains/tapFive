import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { LegalContent } from "@/components/ui/LegalContent";
import { legalPages } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Tap Five collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHero eyebrow="Legal" heading={legalPages.privacy.heading} supporting={legalPages.privacy.updated} />
      <LegalContent>
        <h2>Placeholder content</h2>
        <p>
          This page is a placeholder for Tap Five&apos;s privacy policy. Replace this content
          with a full policy covering what information is collected, how it is used, how it is
          stored, and the choices customers have over their data before launch.
        </p>
        <h2>Information we may collect</h2>
        <p>
          Add detail here on any information collected through the website, such as contact form
          submissions, order details, or analytics data.
        </p>
        <h2>How we use information</h2>
        <p>
          Explain how collected information is used, for example to fulfil orders, respond to
          enquiries, or improve the website.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be directed to the contact details listed on the{" "}
          <a href="/contact">Contact</a> page.
        </p>
      </LegalContent>
    </div>
  );
}
