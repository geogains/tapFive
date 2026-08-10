"use client";

import type { PricingTier } from "@/data/pricing";
import { cn, formatPrice } from "@/lib/utils";

type QuantityPricingSelectorProps = {
  tiers: PricingTier[];
  selectedQuantity: number;
  onSelect: (quantity: number) => void;
  className?: string;
};

/**
 * "Buy more, save more" tier selector. Presents each quantity as a
 * selectable row (not a numeric input) so the discount structure is visible
 * up front, matching how mature ecommerce product pages surface multi-buy
 * pricing.
 */
export function QuantityPricingSelector({
  tiers,
  selectedQuantity,
  onSelect,
  className,
}: QuantityPricingSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)} role="radiogroup" aria-label="Select quantity">
      {tiers.map((tier) => {
        const isSelected = tier.quantity === selectedQuantity;

        return (
          <button
            key={tier.quantity}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(tier.quantity)}
            className={cn(
              "flex w-full items-center justify-between gap-4 rounded-[var(--tf-radius-md)] border px-4 py-3.5 text-left transition-all",
              isSelected
                ? "border-tf-accent bg-tf-neutral-100"
                : "border-tf-neutral-200 hover:border-tf-neutral-400",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isSelected ? "border-tf-accent" : "border-tf-neutral-300",
                )}
              >
                {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-tf-accent" /> : null}
              </span>

              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium text-tf-black sm:text-base">
                  {tier.quantity} {tier.quantity === 1 ? "Card" : "Cards"}
                  {tier.tag ? (
                    <span className="rounded-full bg-tf-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tf-accent">
                      {tier.tag}
                    </span>
                  ) : null}
                </span>
                {tier.savings > 0 ? (
                  <span className="text-xs font-medium text-tf-accent">
                    Save {formatPrice(tier.savings)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-semibold text-tf-black sm:text-base">
                {formatPrice(tier.totalPrice)}
              </span>
              <span className="whitespace-nowrap text-xs text-tf-neutral-500">
                {formatPrice(tier.pricePerCard)} / card
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
