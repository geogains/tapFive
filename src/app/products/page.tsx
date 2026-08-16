import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { CTASection } from "@/components/sections/CTASection";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse Tap Five's NFC Google Review cards, review stands and custom-branded cards for local businesses.",
};

export default function ProductsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Products"
        heading="Find the right Tap Five card for your business"
        supporting="Every product is designed to make leaving a Google review effortless for your customers, from a simple counter card to a fully branded solution."
      />

      <section className="bg-tf-white tf-section">
        <Container>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </div>
  );
}
