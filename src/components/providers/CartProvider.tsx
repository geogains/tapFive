"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "@/data/products";

export type CartItem = {
  /** Product identity — matches `Product.slug`, not the detail-page route slug. */
  slug: string;
  /**
   * Identifies this specific cart line. Defaults to `slug` when omitted, which
   * preserves the original "one line per product" behaviour for simple
   * quick-adds. Product pages that sell the same product under different
   * pricing tiers (e.g. a 3-card bundle vs a single card) must pass a
   * distinct `lineId` so those don't silently merge into one line at the
   * wrong price.
   */
  lineId?: string;
  name: string;
  /**
   * Per-unit price in pence at the moment this line was added. This is only
   * an initial snapshot — it is NOT trusted for any calculation. Every read
   * through `useCart()` re-derives the live per-unit price and line total
   * from the product's own `pricingTiers` (see `resolveCartItem` below),
   * keyed off the line's current `quantity`. This is what makes reducing
   * quantity in the cart correctly step back down through the tiers instead
   * of preserving a stale bundle discount.
   */
  price: number;
  image: string;
  quantity: number;
  /**
   * Free-form per-line configuration captured on the product page (e.g. an
   * Instagram handle, custom branding details). Preserved as-is through
   * quantity/price recalculation. Not yet surfaced in the cart UI — TODO:
   * display once the design for this is finalised. Will also need
   * server-side validation once checkout is connected; it must not be
   * trusted as-is at that point.
   */
  configuration?: Record<string, string>;
  /** Initial merchandising label captured at add-time (e.g. "3-card bundle"). Superseded by the live-derived value on `ResolvedCartItem` — see below. */
  tierLabel?: string;
};

/**
 * What `useCart()` actually exposes for each line: the stored `CartItem`
 * with `price` and `tierLabel` overridden by the live lookup, plus the
 * authoritative bundle total and the highest quantity this product's
 * pricing tiers currently support.
 */
export type ResolvedCartItem = CartItem & {
  /** Authoritative total for this line (pence) — the selected tier's exact total, not `price * quantity`, so it can never drift from rounding. */
  lineTotal: number;
  /** Highest quantity defined in this product's pricing tiers. The "+" control should stop here (see edge-case notes in `updateQuantity`). */
  maxQuantity: number;
};

type AddItemInput = Omit<CartItem, "quantity">;

type CartContextValue = {
  items: ResolvedCartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  /** `quantity` defaults to 1 — pass the full tier quantity to add a multi-buy bundle in a single call rather than incrementing one at a time. */
  addItem: (item: AddItemInput, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tapfive-cart";

/** Highest quantity this product's pricing tiers define — quantity is capped here rather than letting it run past whatever tiers actually exist. */
function getMaxQuantity(slug: string): number {
  const product = products.find((p) => p.slug === slug);
  const tiers = product?.pricingTiers;
  if (!tiers || tiers.length === 0) return Number.POSITIVE_INFINITY;
  return tiers[tiers.length - 1].quantity;
}

function clampQuantity(slug: string, quantity: number): number {
  return Math.max(1, Math.min(quantity, getMaxQuantity(slug)));
}

/**
 * Deterministic per-line identity: product + configuration content only —
 * quantity/tier is intentionally excluded, so changing quantity in the cart
 * (or re-selecting a different tier for the same configuration) always
 * updates the same line rather than fragmenting it. `resolveCartItem`
 * re-derives the correct price for whatever quantity the line ends up at,
 * so nothing about pricing correctness depends on quantity being part of
 * this id.
 *
 * Two adds with identical configuration resolve to the same lineId and
 * merge (quantity increments). Two adds with different configuration
 * resolve to different lineIds and become separate lines — this is what
 * stops e.g. "Business A" and "Business B" from silently overwriting one
 * another under the same line.
 *
 * Uses a small deterministic string hash rather than Math.random()/
 * timestamps, so the same configuration always produces the same id across
 * renders, reloads and devices. Not cryptographic — this is a client-side
 * identity key, not a security boundary.
 */
export function buildLineId(slug: string, configuration?: Record<string, string>): string {
  if (!configuration) return slug;

  // A control character (never typed by a real user) separates pairs, so a
  // value that happens to contain "key=" text can't concatenate into
  // looking like a different adjacent pair and accidentally collide with
  // otherwise-different configuration.
  const PAIR_SEPARATOR = String.fromCharCode(1);
  const canonical = Object.entries(configuration)
    .filter(([, value]) => value.trim() !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join(PAIR_SEPARATOR);

  if (!canonical) return slug;
  return `${slug}::${hashConfiguration(canonical)}`;
}

function hashConfiguration(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/**
 * Re-derives price for a stored cart line from the product's live pricing
 * tiers, keyed off the line's current quantity — this is the single place
 * that turns "quantity" into "price" for every product, so nothing in the
 * cart UI hardcodes any one product's pricing.
 */
function resolveCartItem(item: CartItem): ResolvedCartItem {
  const product = products.find((p) => p.slug === item.slug);
  const tiers = product?.pricingTiers;

  if (!tiers || tiers.length === 0) {
    // Unknown/removed product — fall back to the stored snapshot rather than crashing.
    return { ...item, lineTotal: item.price * item.quantity, maxQuantity: item.quantity };
  }

  const maxQuantity = tiers[tiers.length - 1].quantity;
  const tierQuantity = Math.max(1, Math.min(item.quantity, maxQuantity));
  const tier = tiers.find((t) => t.quantity === tierQuantity) ?? tiers[0];

  return {
    ...item,
    price: tier.pricePerCard,
    lineTotal: tier.totalPrice,
    tierLabel: item.quantity > 1 ? `${item.quantity}-card bundle` : undefined,
    maxQuantity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount only — reading it during render/SSR would
  // either touch `window` on the server or mismatch the server-rendered (empty) markup.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Intentional one-time hydration from localStorage; must happen in an effect to
        // avoid a hydration mismatch against the server-rendered (empty) cart.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(stored));
      }
    } catch {
      // Malformed or inaccessible storage — start from an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: AddItemInput, quantity = 1) => {
    const lineId = item.lineId ?? item.slug;
    setItems((current) => {
      const existing = current.find((i) => (i.lineId ?? i.slug) === lineId);
      if (existing) {
        const nextQuantity = clampQuantity(item.slug, existing.quantity + quantity);
        return current.map((i) =>
          (i.lineId ?? i.slug) === lineId ? { ...i, ...item, quantity: nextQuantity } : i,
        );
      }
      return [...current, { ...item, quantity: clampQuantity(item.slug, quantity) }];
    });
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((current) => current.filter((i) => (i.lineId ?? i.slug) !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) return current.filter((i) => (i.lineId ?? i.slug) !== lineId);
      return current.map((i) =>
        (i.lineId ?? i.slug) === lineId ? { ...i, quantity: clampQuantity(i.slug, quantity) } : i,
      );
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // The only place price ever gets attached to a line for display or totals —
  // always freshly derived from the product's pricing tiers and the line's
  // current quantity, never the raw value sitting in `items` state/storage.
  const resolvedItems = useMemo(() => items.map(resolveCartItem), [items]);

  const itemCount = useMemo(
    () => resolvedItems.reduce((sum, item) => sum + item.quantity, 0),
    [resolvedItems],
  );

  const subtotal = useMemo(
    () => resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [resolvedItems],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: resolvedItems,
      itemCount,
      subtotal,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      resolvedItems,
      itemCount,
      subtotal,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
