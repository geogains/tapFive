import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { testimonials, testimonialsSection } from "@/data/site-content";

// Testimonials content lives in `src/data/site-content.ts` (`testimonials`).
// Column order is derived by slicing that array in groups of three, so the
// entry order there directly controls which column each testimonial appears in.
const columnTestimonials = testimonials.map(({ quote, name, role }) => ({
  text: quote,
  name,
  role,
}));

const firstColumn = columnTestimonials.slice(0, 3);
const secondColumn = columnTestimonials.slice(3, 6);
const thirdColumn = columnTestimonials.slice(6, 9);

export function Testimonials() {
  return (
    <section className="bg-tf-neutral-100 tf-section overflow-hidden">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={testimonialsSection.eyebrow}
          heading={testimonialsSection.heading}
          supporting={testimonialsSection.supporting}
          align="center"
        />

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          {/* Below md there's only room for one column, so it cycles through all nine
              testimonials rather than being limited to the first three. Duration is
              deliberately slow (not just proportional to the 3-card columns' ~15s) so
              each card is comfortably readable before it scrolls past on mobile. */}
          <TestimonialsColumn testimonials={columnTestimonials} className="md:hidden" duration={60} />
          <TestimonialsColumn testimonials={firstColumn} className="hidden md:block" duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </Container>
    </section>
  );
}
