"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { formatPrice } from "@/lib/utils";

export function CartPageContent() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-tf-neutral-400" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-medium tracking-tight text-tf-black">
            Your cart is empty
          </h2>
          <p className="text-sm text-tf-neutral-600">
            Browse our products and add a card to get started.
          </p>
        </div>
        <Button href="/products">Browse products</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <ul className="flex flex-col gap-6">
        {items.map((item) => {
          const lineId = item.lineId ?? item.slug;
          return (
            <CartLineItem
              key={lineId}
              item={item}
              onIncrement={() => updateQuantity(lineId, item.quantity + 1)}
              onDecrement={() => updateQuantity(lineId, item.quantity - 1)}
              onRemove={() => removeItem(lineId)}
            />
          );
        })}
      </ul>

      <div className="flex h-fit flex-col gap-5 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 p-6">
        <h2 className="font-display text-lg font-medium tracking-tight text-tf-black">Summary</h2>

        <div className="flex items-center justify-between text-sm">
          <span className="text-tf-neutral-600">Subtotal</span>
          <span className="text-base font-semibold text-tf-black">{formatPrice(subtotal)}</span>
        </div>

        <Button
          variant="primary"
          className="w-full bg-tf-black text-tf-white hover:bg-tf-neutral-800"
          disabled
          title="Checkout is coming soon"
        >
          Checkout (coming soon)
        </Button>

        <Button href="/products" variant="secondary" className="w-full border-tf-neutral-300 text-tf-black hover:border-tf-black">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
