import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/ui/TestimonialCard";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials, testimonialsSection } from "@/data/site-content";

/**
 * Placeholder social proof only. Replace the entries in
 * `src/data/site-content.ts` (`testimonials`) with real, verified
 * customer testimonials before launch — do not invent names,
 * businesses, star ratings or statistics.
 */
export function Testimonials() {
  return (
    <section className="bg-tf-neutral-100 tf-section">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={testimonialsSection.eyebrow}
          heading={testimonialsSection.heading}
          supporting={testimonialsSection.supporting}
          align="center"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={`${testimonial.name}-${index}`} delay={index * 0.08}>
              <TestimonialCard
                quote={testimonial.quote}
                name={testimonial.name}
                role={testimonial.role}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
