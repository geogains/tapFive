import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ProductHowItWorks({ steps }: { steps: string[] }) {
  return (
    <section className="bg-tf-white tf-section">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow="How it works" heading="From order to first tap" />

        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="flex flex-col gap-3 border-t border-tf-neutral-300 pt-5">
              <span className="font-display text-sm font-semibold text-tf-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-base font-medium tracking-tight text-tf-black">{step}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
