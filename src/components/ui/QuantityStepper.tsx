"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Disables the "+" control, e.g. once the product's highest defined pricing tier is reached. */
  disableIncrement?: boolean;
  className?: string;
};

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  disableIncrement,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[var(--tf-radius-sm)] border border-tf-neutral-200",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className="tf-focus-ring flex h-8 w-8 items-center justify-center text-tf-neutral-600 transition-colors hover:text-tf-black"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span className="w-6 text-center text-sm font-medium text-tf-black" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disableIncrement}
        aria-label="Increase quantity"
        className="tf-focus-ring flex h-8 w-8 items-center justify-center text-tf-neutral-600 transition-colors hover:text-tf-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-tf-neutral-600"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
