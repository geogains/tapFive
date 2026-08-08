"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";
import { Logo, HEADER_LOGO_SIZE } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import { useCart } from "@/components/providers/CartProvider";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { nav } from "@/data/site-content";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 48;

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const scrolledPastThreshold = useScrolledPast(SCROLL_THRESHOLD);
  // Homepage: transparent at the top, translucent/blurred black once scrolled — existing behaviour, untouched.
  // Every other route: always a solid, opaque black header — never transparent, never scroll-dependent.
  const homeScrolled = isHome && scrolledPastThreshold;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          !isHome
            ? "border-b border-white/10 bg-tf-black"
            : homeScrolled
              ? "border-b border-white/10 bg-tf-black/75 backdrop-blur-md"
              : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[var(--tf-header-height)] w-full max-w-[var(--tf-container)] items-center justify-between px-6 sm:px-8 lg:px-10">
          <Logo variant="white" size={HEADER_LOGO_SIZE} />

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="tf-focus-ring text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <Button href="/products" size="md">
                Shop Cards
              </Button>
            </div>

            <button
              type="button"
              onClick={openCart}
              className="tf-focus-ring relative flex h-10 w-10 items-center justify-center rounded-[var(--tf-radius-sm)] text-white"
              aria-label={itemCount > 0 ? `Open cart, ${itemCount} items` : "Open cart"}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-tf-accent px-1 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="tf-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--tf-radius-sm)] text-white lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
