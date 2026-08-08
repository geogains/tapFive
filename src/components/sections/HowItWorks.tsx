import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HowItWorksStep } from "@/components/ui/HowItWorksStep";
import { Reveal } from "@/components/ui/Reveal";
import { howItWorks } from "@/data/site-content";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-tf-white tf-section">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={howItWorks.eyebrow}
          heading={howItWorks.heading}
          supporting={howItWorks.supporting}
        />

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {howItWorks.steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <HowItWorksStep
                number={step.number}
                title={step.title}
                description={step.description}
                image={step.image}
                imageAlt={step.imageAlt}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
