"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { nav } from "@/data/site-content";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] bg-tf-black lg:hidden"
        >
          <div className="flex h-[var(--tf-header-height)] items-center justify-between px-6 sm:px-8">
            <Logo variant="white" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="tf-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--tf-radius-sm)] text-white"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <motion.nav
            aria-label="Mobile"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
              closed: {},
            }}
            className="flex flex-col gap-2 px-6 pt-6 sm:px-8"
          >
            {nav.map((item) => (
              <motion.div
                key={item.href}
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 12 },
                }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="tf-focus-ring block border-b border-white/10 py-4 font-display text-2xl font-medium tracking-tight text-white"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}

            <div className="pt-6">
              <Button href="/products" size="lg" className="w-full" onClick={onClose}>
                Shop Cards
              </Button>
            </div>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
