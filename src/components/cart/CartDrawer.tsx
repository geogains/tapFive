"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, subtotal, promoDiscount, total, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-tf-black/50 backdrop-blur-sm"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-tf-white shadow-[0_0_60px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-tf-neutral-200 px-6 py-5">
              <h2 className="font-display text-lg font-medium tracking-tight text-tf-black">
                Your Cart
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="tf-focus-ring flex h-9 w-9 items-center justify-center rounded-[var(--tf-radius-sm)] text-tf-neutral-600 hover:text-tf-black"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-tf-neutral-400" aria-hidden="true" />
                <p className="text-sm text-tf-neutral-600">Your cart is empty.</p>
                <Button href="/products" variant="secondary" className="border-tf-neutral-300 text-tf-black hover:border-tf-black" onClick={closeCart}>
                  Browse products
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
                  {items.map((item) => {
                    const lineId = item.lineId ?? item.slug;
                    return (
                      <CartLineItem
                        key={lineId}
                        item={item}
                        variant="compact"
                        onIncrement={() => updateQuantity(lineId, item.quantity + 1)}
                        onDecrement={() => updateQuantity(lineId, item.quantity - 1)}
                        onRemove={() => removeItem(lineId)}
                      />
                    );
                  })}
                </ul>

                <div className="flex flex-col gap-4 border-t border-tf-neutral-200 px-6 py-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tf-neutral-600">Subtotal</span>
                      <span className="text-tf-black">{formatPrice(subtotal)}</span>
                    </div>
                    {promoDiscount > 0 ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-tf-accent">TAP25 · 25% off</span>
                        <span className="font-medium text-tf-accent">-{formatPrice(promoDiscount)}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-base font-semibold text-tf-black">Total</span>
                      <span className="text-base font-semibold text-tf-black">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button href="/cart" variant="secondary" className="border-tf-neutral-300 text-tf-black hover:border-tf-black w-full" onClick={closeCart}>
                    View Cart
                  </Button>

                  <Button
                    variant="primary"
                    className="w-full bg-tf-black text-tf-white hover:bg-tf-neutral-800"
                    disabled
                    title="Checkout is coming soon"
                  >
                    Checkout (coming soon)
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
