import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/product/ProductDetailPage";
import { products } from "@/data/products";

type Params = { slug: string };

function findProduct(slug: string) {
  return products.find((product) => product.routeSlug === slug);
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.routeSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) notFound();

  return <ProductDetailPage product={product} />;
}
