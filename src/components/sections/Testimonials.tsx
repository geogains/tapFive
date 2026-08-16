import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { ImageGallery } from "@/components/ui/carousel-circular-image-gallery";
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

// Widened only from `lg` up, where the 3-column layout has room to breathe.
// Below `lg` the written column(s) keep their original narrower sizing.
const wideColumnClassName = "hidden md:block lg:flex-1 lg:min-w-0";
const wideCardClassName = "max-w-xs lg:max-w-none";

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 bg-tf-neutral-100 tf-section overflow-hidden">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow={testimonialsSection.eyebrow}
          heading={testimonialsSection.heading}
          supporting={testimonialsSection.supporting}
          align="center"
        />
      </Container>

      <Container className="mt-14 flex max-h-[738px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] lg:w-[clamp(940px,92vw,1400px)] lg:max-w-none lg:px-0">
        {/* Below md there's only room for one column, so it cycles through all nine
            testimonials rather than being limited to the first three. Duration is
            deliberately slow (not just proportional to the 3-card columns' ~15s) so
            each card is comfortably readable before it scrolls past on mobile. */}
        <TestimonialsColumn testimonials={columnTestimonials} className="md:hidden" duration={60} />
        <TestimonialsColumn
          testimonials={firstColumn}
          className={wideColumnClassName}
          duration={15}
          cardClassName={wideCardClassName}
        />
        <TestimonialsColumn
          testimonials={secondColumn}
          className={wideColumnClassName}
          duration={19}
          cardClassName={wideCardClassName}
        />
        <TestimonialsColumn
          testimonials={thirdColumn}
          className="hidden lg:block lg:flex-1 lg:min-w-0"
          duration={17}
          cardClassName={wideCardClassName}
        />
      </Container>

      {/* Image carousel — a separate, centred block underneath the written columns
          (not layered on top of them). Reuses the same gap-14 rhythm as the
          heading-to-columns spacing above so the section reads consistently. */}
      <Container className="mt-14 flex flex-col items-center">
        <h3 className="text-center font-display text-xl font-normal tracking-tight text-tf-neutral-700 sm:text-2xl">
          Real businesses. Real results.
        </h3>
        <div className="mt-6 w-full sm:mt-8">
          <ImageGallery />
        </div>
      </Container>
    </section>
  );
}
