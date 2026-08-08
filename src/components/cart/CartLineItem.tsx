"use client";

import Image from "next/image";
import type { ResolvedCartItem } from "@/components/providers/CartProvider";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { cn, formatPrice } from "@/lib/utils";

type CartLineItemProps = {
  item: ResolvedCartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  /** "compact" is used in the slide-out drawer; "full" (default) on the dedicated /cart page. */
  variant?: "compact" | "full";
  className?: string;
};

/**
 * Single cart line, shared by the cart drawer and the /cart page so the
 * mobile-layout fix and quantity-driven pricing display only exist in one
 * place. Image + name/price sit in one row; quantity controls + Remove sit
 * in their own full-width row below, so neither row has to fight the other
 * for horizontal space on narrow screens.
 */
export function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  variant = "full",
  className,
}: CartLineItemProps) {
  const isCompact = variant === "compact";

  return (
    <li
      className={cn(
        "flex flex-col gap-3",
        !isCompact && "rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-4 sm:p-5",
        className,
      )}
    >
      <div className={cn("flex", isCompact ? "gap-3" : "gap-4 sm:gap-5")}>
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-[var(--tf-radius-md)] bg-tf-neutral-900",
            isCompact ? "h-16 w-16 sm:h-20 sm:w-20" : "h-20 w-20 sm:h-28 sm:w-28",
          )}
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes={isCompact ? "80px" : "112px"}
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <h3
            className={cn(
              "font-medium tracking-tight text-tf-black",
              isCompact ? "text-sm" : "font-display text-sm sm:text-lg",
            )}
          >
            {item.name}
          </h3>

          <div className="flex flex-col sm:items-end">
            {item.quantity > 1 ? (
              <>
                <span className="whitespace-nowrap text-sm font-semibold text-tf-accent">
                  {formatPrice(item.lineTotal)} total
                </span>
                <span className="whitespace-nowrap text-xs text-tf-neutral-500">
                  {formatPrice(item.price)} each
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap text-sm font-semibold text-tf-accent">
                {formatPrice(item.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <QuantityStepper
          quantity={item.quantity}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          disableIncrement={item.quantity >= item.maxQuantity}
        />
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "tf-focus-ring font-medium text-tf-neutral-500 underline-offset-2 hover:text-tf-black hover:underline",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
