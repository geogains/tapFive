import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BenefitItem } from "@/components/ui/BenefitItem";
import { Reveal } from "@/components/ui/Reveal";
import { whyTapFive } from "@/data/site-content";

export function WhyTapFive() {
  return (
    <section id="why-tap-five" className="scroll-mt-24 bg-tf-black tf-section">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={whyTapFive.eyebrow}
          heading={whyTapFive.heading}
          supporting={whyTapFive.supporting}
          tone="dark"
        />

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {whyTapFive.points.map((point, index) => (
            <Reveal key={point.title} delay={index * 0.08}>
              <BenefitItem
                icon={point.icon}
                title={point.title}
                description={point.description}
                tone="dark"
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
