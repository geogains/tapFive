import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { finalCta } from "@/data/site-content";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-tf-black tf-section">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(47,109,255,0.16)_0%,_transparent_60%)]"
      />
      <Container className="relative flex flex-col items-center gap-8 text-center">
        <Reveal>
          <h2 className="font-display max-w-2xl text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl">
            {finalCta.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="max-w-xl text-base leading-relaxed text-tf-neutral-300 sm:text-lg">
            {finalCta.supporting}
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button href={finalCta.primaryCta.href} size="lg">
              {finalCta.primaryCta.label}
            </Button>
            <Button href={finalCta.secondaryCta.href} variant="secondary" size="lg">
              {finalCta.secondaryCta.label}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
