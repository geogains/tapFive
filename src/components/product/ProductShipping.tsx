import { Container } from "@/components/ui/Container";
import { shippingSection } from "@/data/productDetailContent";

export function ProductShipping() {
  return (
    <section className="bg-tf-white tf-section">
      <Container className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-medium tracking-tight text-tf-black sm:text-3xl">
          {shippingSection.heading}
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-tf-neutral-600">{shippingSection.body}</p>
      </Container>
    </section>
  );
}
