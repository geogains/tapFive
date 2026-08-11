"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PROMOTION } from "@/data/promotion";

const SEEN_STORAGE_KEY = "tapfive-tap25-promo-seen";

/**
 * Homepage-only promotional modal announcing TAP25. Purely communication —
 * the discount itself is already globally active (`src/data/promotion.ts`,
 * applied in `CartProvider`), so nothing here flips a switch; closing this
 * modal in any way still leaves TAP25 pricing active in the cart.
 *
 * Shown once per browser via `localStorage`. The seen-check can only run
 * client-side, so this renders nothing until an effect confirms the
 * promotion hasn't been seen yet — same "hydrate after mount" shape as
 * `CartProvider`'s localStorage read, so the server-rendered page and the
 * first client render agree (nothing shown) and there's no hydration
 * mismatch, just the modal appearing an instant after mount on a genuine
 * first visit.
 */
export function TapPromoModal() {
  const [shouldShow, setShouldShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(SEEN_STORAGE_KEY);
      // Intentional one-time reveal from localStorage; must happen in an effect to avoid
      // a hydration mismatch against the server-rendered (hidden) markup — see CartProvider.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!seen) setShouldShow(true);
    } catch {
      // Inaccessible storage (e.g. private browsing edge cases) — skip the promo rather than throw.
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(SEEN_STORAGE_KEY, "1");
    } catch {
      // Best-effort — worst case the modal shows again next visit.
    }
    setShouldShow(false);
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus?.();
    };
  }, [shouldShow, dismiss]);

  return (
    <AnimatePresence>
      {shouldShow ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-tf-black/75"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tap25-promo-heading"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-y-auto rounded-[28px] bg-[#eef0f0] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] outline-none sm:max-h-[88vh]"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close promotional offer"
              className="tf-focus-ring absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-tf-white/80 text-tf-black transition-colors hover:bg-tf-white sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex flex-1 flex-col items-center gap-8 px-6 pb-8 pt-14 sm:px-10 sm:pt-16 lg:flex-row lg:items-center lg:gap-14 lg:px-16 lg:py-14">
              <div className="relative aspect-square w-full max-w-[15rem] shrink-0 sm:max-w-xs lg:max-w-md">
                <Image
                  src="/images/google-card1.png"
                  alt="Tap Five card"
                  fill
                  sizes="(min-width: 1024px) 28rem, 60vw"
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-tf-neutral-500">
                  Limited-time offer
                </span>

                <h2
                  id="tap25-promo-heading"
                  className="font-display leading-[0.85] tracking-tight text-tf-black"
                >
                  <span className="block text-[4.25rem] font-semibold sm:text-[5.5rem] lg:text-[7rem]">
                    {PROMOTION.discountPercent}%
                  </span>
                  <span className="block text-[2.75rem] font-semibold text-tf-accent sm:text-[3.5rem] lg:text-[4.5rem]">
                    OFF
                  </span>
                </h2>

                <p className="text-base text-tf-neutral-700 sm:text-lg">Your Tap Five order</p>

                <span className="inline-flex items-center rounded-full bg-tf-black px-4 py-1.5 text-sm font-semibold tracking-wide text-tf-white">
                  CODE: {PROMOTION.code}
                </span>

                <p className="max-w-xs text-sm text-tf-neutral-500">
                  Automatically applied at checkout.
                </p>
              </div>
            </div>

            <div className="flex justify-center px-6 pb-8 sm:px-10 lg:pb-12">
              <Button
                type="button"
                size="lg"
                onClick={dismiss}
                className="w-full bg-tf-black text-tf-white hover:bg-tf-neutral-800 sm:w-auto sm:min-w-[16rem]"
              >
                Apply Discount
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
