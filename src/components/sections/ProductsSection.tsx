import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { products } from "@/data/products";
import { productsSection } from "@/data/site-content";

export function ProductsSection() {
  return (
    <section id="products" className="scroll-mt-24 bg-tf-neutral-100 tf-section">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow={productsSection.eyebrow}
            heading={productsSection.heading}
            supporting={productsSection.supporting}
          />
          <Button href={productsSection.viewAllCta.href} className="shrink-0 bg-tf-black text-tf-white hover:bg-tf-neutral-800">
            {productsSection.viewAllCta.label}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.1}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
