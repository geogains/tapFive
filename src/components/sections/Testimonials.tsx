import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { testimonials, testimonialsSection } from "@/data/site-content";

// Testimonials content lives in `src/data/site-content.ts` (`testimonials`).
// Column order is derived by slicing that array in groups of three, so the
// entry order there directly controls which column each testimonial appears in.
const columnTestimonials = testimonials.map(({ quote, name, role, image }) => ({
  text: quote,
  name,
  role,
  image,
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
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </Container>
    </section>
  );
}
