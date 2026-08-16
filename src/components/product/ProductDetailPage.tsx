"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { Product } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { useCart, buildLineId } from "@/components/providers/CartProvider";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantityPricingSelector } from "@/components/product/QuantityPricingSelector";
import { ProductBenefits } from "@/components/product/ProductBenefits";
import {
  ProductConfiguration,
  emptyProductConfiguration,
  toCartConfiguration,
  validateProductConfiguration,
  normalizeInstagramHandle,
  type ProductConfigurationValue,
  type ConfigurationValidationErrors,
} from "@/components/product/ProductConfiguration";
import { ProductHowItWorks } from "@/components/product/ProductHowItWorks";
import { ProductCompatibility } from "@/components/product/ProductCompatibility";
import { ProductShipping } from "@/components/product/ProductShipping";
import { PurchaseReassurance } from "@/components/product/PurchaseReassurance";
import { formatPrice } from "@/lib/utils";

export function ProductDetailPage({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [configuration, setConfiguration] = useState<ProductConfigurationValue>(
    emptyProductConfiguration,
  );
  const [configErrors, setConfigErrors] = useState<ConfigurationValidationErrors>({});
  const [added, setAdded] = useState(false);
  // Multi-link only — true while its logo upload is in flight (initial or a
  // replace); Add to Cart is disabled for that window so a customer can
  // never submit with a stale/no-longer-current logo reference.
  const [isMultiLinkLogoUploading, setIsMultiLinkLogoUploading] = useState(false);

  const selectedTier =
    product.pricingTiers.find((tier) => tier.quantity === selectedQuantity) ??
    product.pricingTiers[0];

  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [added]);

  // Once a field has an error showing, re-check it on every keystroke so the
  // message clears the moment it's resolved — but only bother re-validating
  // at all once there's something to potentially clear.
  const handleConfigurationChange = (next: ProductConfigurationValue) => {
    setConfiguration(next);
    setConfigErrors((current) => {
      if (Object.keys(current).length === 0) return current;
      const revalidated = validateProductConfiguration(product.configurationType, next);
      const stillInvalid: ConfigurationValidationErrors = {};
      (Object.keys(current) as Array<keyof ProductConfigurationValue>).forEach((key) => {
        if (revalidated.errors[key]) stillInvalid[key] = revalidated.errors[key];
      });
      return stillInvalid;
    });
  };

  const handleAddToCart = () => {
    // Light formatting (e.g. adding a leading "@") before validating, so the
    // check and the stored value agree with what the customer will see.
    // Always applied (not just for the "instagram" type) since multi-link
    // also has an Instagram field, and it's a no-op on an empty/unused one.
    const normalizedConfiguration: ProductConfigurationValue = {
      ...configuration,
      instagramHandle: normalizeInstagramHandle(configuration.instagramHandle),
    };

    const validation = validateProductConfiguration(product.configurationType, normalizedConfiguration);
    if (!validation.valid) {
      setConfigErrors(validation.errors);
      return;
    }
    setConfigErrors({});
    if (normalizedConfiguration !== configuration) {
      setConfiguration(normalizedConfiguration);
    }

    const cartConfiguration = toCartConfiguration(product.configurationType, normalizedConfiguration);

    addItem(
      {
        slug: product.slug,
        // Identity is product + configuration content (not quantity/tier),
        // so two different configurations of the same product never merge
        // and silently overwrite one another, while quantity changes and
        // re-selecting a different tier for the SAME configuration keep
        // updating this one line — see `buildLineId` for the full rationale.
        lineId: buildLineId(product.slug, cartConfiguration),
        name: product.name,
        price: selectedTier.pricePerCard,
        image: product.image,
        tierLabel: selectedTier.quantity > 1 ? `${selectedTier.quantity}-card bundle` : undefined,
        configuration: cartConfiguration,
      },
      selectedTier.quantity,
    );
    setAdded(true);
    openCart();
  };

  return (
    <div>
      <section className="bg-tf-white pb-16 pt-[calc(var(--tf-header-height)+2rem)] sm:pt-[calc(var(--tf-header-height)+2.5rem)]">
        <Container className="flex flex-col gap-8 lg:gap-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-tf-neutral-500">
            <Link href="/products" className="transition-colors hover:text-tf-black">
              Products
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-tf-black">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="lg:sticky lg:top-[calc(var(--tf-header-height)+2rem)] lg:h-fit">
              <ProductGallery
                images={product.gallery ?? [product.image]}
                alt={product.name}
                imageFit={product.imageFit}
                imageScale={product.imageScale}
              />
            </div>

            <div className="flex flex-col gap-6">
              {product.badge ? <Badge>{product.badge}</Badge> : null}

              <div className="flex flex-col gap-3">
                <h1 className="font-display text-3xl font-medium tracking-tight text-tf-black sm:text-4xl">
                  {product.name}
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-tf-neutral-600">
                  {product.shortDescription}
                </p>
              </div>

              <div className="flex flex-col gap-1 border-y border-tf-neutral-200 py-5">
                <span className="font-display text-3xl font-semibold tracking-tight text-tf-black">
                  {formatPrice(selectedTier.totalPrice)}
                </span>
                <span className="text-sm text-tf-neutral-500">
                  {formatPrice(selectedTier.pricePerCard)} per card
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-tf-black">
                  Buy more, save more
                </h2>
                <QuantityPricingSelector
                  tiers={product.pricingTiers}
                  selectedQuantity={selectedQuantity}
                  onSelect={setSelectedQuantity}
                />
              </div>

              <ProductConfiguration
                configurationType={product.configurationType}
                value={configuration}
                onChange={handleConfigurationChange}
                errors={configErrors}
                onMultiLinkUploadingChange={setIsMultiLinkLogoUploading}
              />

              <Button
                type="button"
                size="lg"
                onClick={handleAddToCart}
                disabled={isMultiLinkLogoUploading}
                className="w-full bg-tf-black text-tf-white hover:bg-tf-neutral-800"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Added to cart
                  </>
                ) : isMultiLinkLogoUploading ? (
                  "Uploading logo…"
                ) : (
                  `Add to Cart — ${formatPrice(selectedTier.totalPrice)}`
                )}
              </Button>

              <PurchaseReassurance />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-tf-neutral-100 tf-section">
        <Container className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-medium tracking-tight text-tf-black sm:text-3xl">
            Product overview
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-tf-neutral-600">
            {product.description}
          </p>
          <ProductBenefits benefits={product.benefits} />
        </Container>
      </section>

      <ProductHowItWorks steps={product.howItWorks} />
      <ProductCompatibility />
      <ProductShipping />

      <section className="bg-tf-neutral-100 tf-section">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow="FAQ" heading={`Questions about the ${product.name}`} />
          <FAQAccordion items={product.faqs} />
        </Container>
      </section>
    </div>
  );
}
