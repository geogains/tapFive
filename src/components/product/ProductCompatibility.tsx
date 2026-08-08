import { Container } from "@/components/ui/Container";
import { compatibilitySection } from "@/data/productDetailContent";

export function ProductCompatibility() {
  return (
    <section className="bg-tf-neutral-100 tf-section">
      <Container className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-medium tracking-tight text-tf-black sm:text-3xl">
          {compatibilitySection.heading}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-tf-neutral-600">
          {compatibilitySection.body}
        </p>
      </Container>
    </section>
  );
}
