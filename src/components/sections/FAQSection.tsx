import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { faqs } from "@/data/faqs";
import { faqSection } from "@/data/site-content";

export function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-tf-white tf-section">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SectionHeading
          eyebrow={faqSection.eyebrow}
          heading={faqSection.heading}
          supporting={faqSection.supporting}
        />
        <FAQAccordion items={faqs} />
      </Container>
    </section>
  );
}
