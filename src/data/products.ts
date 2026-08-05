/**
 * Product catalogue for the Tap Five template.
 *
 * This is placeholder product data for template purposes.
 * Add, remove or edit entries here — the homepage and /products
 * page both read from this single source. No checkout is wired
 * up yet; `href` currently points at the /products page.
 */

export type Product = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  priceLabel: string;
  features: string[];
  badge?: string;
  href: string;
};

export const products: Product[] = [
  {
    slug: "counter-review-card",
    name: "Counter Review Card",
    shortDescription:
      "A premium card for reception desks, counters and payment areas.",
    description:
      "Our signature card, designed to sit naturally beside a till or reception desk. A single tap takes customers straight to your Google review page.",
    image: "/images/products/counter-review-card.svg",
    priceLabel: "From £29",
    features: [
      "Premium finish, durable everyday use",
      "Pre-configured to your Google review link",
      "Compact counter or desk footprint",
      "Works with iPhone and Android",
    ],
    badge: "Most Popular",
    href: "/products#counter-review-card",
  },
  {
    slug: "review-stand",
    name: "Review Stand",
    shortDescription:
      "A freestanding option for tables, salons, restaurants and service desks.",
    description:
      "A freestanding stand that keeps your review card visible and upright, ideal for tables, salon stations and service counters.",
    image: "/images/products/review-stand.svg",
    priceLabel: "From £39",
    features: [
      "Freestanding, stable design",
      "Ideal for tables and service desks",
      "Reusable — update the link anytime",
      "Discreet, professional appearance",
    ],
    href: "/products#review-stand",
  },
  {
    slug: "custom-branded-card",
    name: "Custom-Branded Card",
    shortDescription:
      "A customised card using your logo, colours and review link.",
    description:
      "Fully branded to match your business, your logo, your colours, configured with your Google review link from the outset.",
    image: "/images/products/custom-branded-card.svg",
    priceLabel: "From £49",
    features: [
      "Your logo and brand colours",
      "Configured to your review link before dispatch",
      "Premium print finish",
      "Great for multi-location businesses",
    ],
    badge: "Custom",
    href: "/products#custom-branded-card",
  },
];
