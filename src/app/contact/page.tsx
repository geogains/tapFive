import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { company, contactPage } from "@/data/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Tap Five about NFC Google Review cards for your business.",
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow={contactPage.eyebrow}
        heading={contactPage.heading}
        supporting={contactPage.supporting}
      />

      <section className="bg-tf-white tf-section">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="flex flex-col gap-8">
            <h2 className="font-display text-xl font-medium tracking-tight text-tf-black">
              Contact details
            </h2>
            <ul className="flex flex-col gap-5 text-sm text-tf-neutral-700">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-tf-accent" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="tf-focus-ring hover:text-tf-accent">
                  {company.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <ContactForm />
          </div>
        </Container>
      </section>
    </div>
  );
}
