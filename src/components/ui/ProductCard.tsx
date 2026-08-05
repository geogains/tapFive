import Image from "next/image";
import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  return (
    <article
      id={product.slug}
      className={cn(
        "group relative flex scroll-mt-28 flex-col overflow-hidden rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 bg-tf-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      {product.badge ? (
        <div className="absolute left-4 top-4 z-10">
          <Badge>{product.badge}</Badge>
        </div>
      ) : null}

      <div className="relative aspect-square w-full overflow-hidden bg-tf-neutral-900">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-medium tracking-tight text-tf-black">
            {product.name}
          </h3>
          <span className="whitespace-nowrap text-sm font-semibold text-tf-accent">
            {product.priceLabel}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-tf-neutral-600">{product.shortDescription}</p>

        <ul className="flex flex-col gap-2">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-tf-neutral-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-tf-accent" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={product.href}
          className="tf-focus-ring mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-tf-black transition-colors hover:text-tf-accent"
        >
          View product
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
