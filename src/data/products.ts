import { buildPricingTiers, type PricingTier } from "@/data/pricing";
import type { Faq } from "@/data/faqs";

/**
 * Product catalogue for the Tap Five site.
 *
 * Add, remove or edit entries here — the homepage, /products listing page
 * and the individual /products/[slug] detail pages all read from this
 * single source. No checkout is wired up yet.
 */

/** Which purchase-configuration UI a product's detail page should render. */
export type ConfigurationType = "google-business" | "instagram" | "custom-branding";

export type Product = {
  /** Internal identity used for cart line matching and the /products#slug anchor on the listing page. Not the detail-page URL — see `routeSlug`. */
  slug: string;
  /** URL segment for the individual product page: /products/[routeSlug]. */
  routeSlug: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Fuller "key benefits" list shown on the product detail page (distinct from the shorter `features` list used on summary cards). */
  benefits: string[];
  image: string;
  /** Gallery images for the product detail page. Defaults to `[image]` when omitted — only one real photo exists per product today. */
  gallery?: string[];
  /** Object-fit for the product image; defaults to "cover" when omitted. */
  imageFit?: "cover" | "contain";
  /** Uniform display-only scale correction (0–1) so images with less padding baked into the source art appear the same physical size as others; does not affect the source file. */
  imageScale?: number;
  /** Price in minor units (pence) for a single card, source of truth for cart math and future Stripe integration. */
  price: number;
  /** Display label for the price area, e.g. "£40". These are fixed prices, not starting prices — no "From" prefix. */
  priceLabel: string;
  /** Compact bullet list used on summary cards (homepage + listing page). */
  features: string[];
  badge?: string;
  /** "View product" destination — the individual product detail page. */
  href: string;
  /** Which configuration UI the detail page's purchase panel should render. */
  configurationType: ConfigurationType;
  /** "Buy more, save more" quantity tiers (1–5 cards). See `src/data/pricing.ts` — quantities above 1 are TODO placeholders. */
  pricingTiers: PricingTier[];
  /** Steps shown in the detail page's "How it works" section. */
  howItWorks: string[];
  /** Product-specific FAQ entries shown on the detail page (separate from the site-wide FAQ in `faqs.ts`). */
  faqs: Faq[];
};

export const products: Product[] = [
  {
    slug: "counter-review-card",
    routeSlug: "google-review-card",
    name: "Google Review Card",
    shortDescription:
      "Turn happy customers into Google reviews with a simple tap. Customers are taken directly to your Google review page.",
    description:
      "Turn happy customers into Google reviews with a simple tap. Customers are taken directly to your Google review page, making it easier than ever to leave feedback.",
    benefits: [
      "Tap or scan to leave a Google review",
      "NFC + QR code",
      "Pre-configured to your business",
      "Works with compatible iPhone and Android devices",
      "No app required",
      "One-time payment — no subscription",
    ],
    image: "/images/google-card.png",
    price: 4000,
    priceLabel: "£40",
    features: [
      "Tap or scan to leave a Google review",
      "Pre-configured to your Google review page",
      "NFC + QR code",
      "No app required",
    ],
    href: "/products/google-review-card",
    configurationType: "google-business",
    pricingTiers: buildPricingTiers(4000),
    howItWorks: [
      "Order your card",
      "Select your Google business",
      "We configure your NFC + QR code",
      "Customers tap and leave a review",
    ],
    faqs: [
      {
        question: "Does the card require an app?",
        answer:
          "No. Tapping the card opens your Google review page directly in the customer's phone browser — nothing to download or install.",
      },
      {
        question: "Does it work with iPhone and Android?",
        answer:
          "Yes, with compatible NFC-enabled iPhone and Android devices. If a customer's phone doesn't support NFC tapping, the printed QR code works as a fallback.",
      },
      {
        question: "Is there a monthly subscription?",
        answer: "No. This is a one-time payment for the physical card — there's no recurring fee.",
      },
      {
        question: "Does the card arrive configured?",
        answer:
          "Yes. We configure your card with your Google review page before dispatch, so it's ready to use as soon as it arrives.",
      },
      {
        question: "How does the QR code work?",
        answer:
          "Every card also has a printed QR code as a backup for phones or situations where NFC tapping isn't available — scanning it opens the same Google review page.",
      },
    ],
  },
  {
    slug: "review-stand",
    routeSlug: "instagram-follow-card",
    name: "Instagram Follow Card",
    shortDescription:
      "Make it effortless for customers to find and follow your business on Instagram with a simple tap.",
    description:
      "Turn customers into Instagram followers with a simple tap. Customers are taken directly to your Instagram profile without having to search for your business.",
    benefits: [
      "Tap or scan to open your Instagram profile",
      "NFC + QR code",
      "Pre-configured to your Instagram",
      "Works with compatible iPhone and Android devices",
      "No app required",
      "One-time payment — no subscription",
    ],
    image: "/images/instagram-card.png",
    price: 4000,
    priceLabel: "£40",
    features: [
      "Tap or scan to open your Instagram",
      "Pre-configured to your Instagram profile",
      "NFC + QR code",
      "No app required",
    ],
    href: "/products/instagram-follow-card",
    configurationType: "instagram",
    pricingTiers: buildPricingTiers(4000),
    howItWorks: [
      "Order your card",
      "Provide your Instagram profile",
      "We configure the card",
      "Customers tap and follow",
    ],
    faqs: [
      {
        question: "Does the card require an app?",
        answer:
          "No. Tapping the card opens your Instagram profile directly in the customer's phone browser, or the Instagram app if it's installed.",
      },
      {
        question: "Does it work with iPhone and Android?",
        answer:
          "Yes, with compatible NFC-enabled iPhone and Android devices. The printed QR code works as a fallback where NFC isn't available.",
      },
      {
        question: "Is there a monthly subscription?",
        answer: "No. This is a one-time payment for the physical card — there's no recurring fee.",
      },
      {
        question: "Does the card arrive configured?",
        answer:
          "Yes. We configure your card with your Instagram profile before dispatch, so it's ready to use as soon as it arrives.",
      },
      {
        question: "How does the QR code work?",
        answer:
          "Every card also has a printed QR code as a backup — scanning it opens the same Instagram profile as the NFC tap.",
      },
    ],
  },
  {
    slug: "custom-branded-card",
    routeSlug: "custom-branded-card",
    name: "Custom Branded Card",
    shortDescription:
      "A fully branded NFC card designed around your business, with your logo, colours and chosen destination.",
    description:
      "A fully branded NFC card designed around your business. Add your logo and brand identity while choosing exactly where customers are sent when they tap or scan.",
    benefits: [
      "Customised with your logo and branding",
      "Choose the destination",
      "NFC + QR code",
      "Designed and configured before dispatch",
      "Works with compatible iPhone and Android devices",
      "One-time payment — no subscription",
    ],
    image: "/images/custom-card.png",
    price: 7000,
    priceLabel: "£70",
    features: [
      "Customised with your logo and branding",
      "Choose where customers are sent",
      "NFC + QR code",
      "Designed and configured before dispatch",
    ],
    href: "/products/custom-branded-card",
    configurationType: "custom-branding",
    pricingTiers: buildPricingTiers(7000),
    howItWorks: [
      "Order your card",
      "Send your branding/details",
      "We prepare and configure your card",
      "Receive your ready-to-use branded card",
    ],
    faqs: [
      {
        question: "Does the card require an app?",
        answer:
          "No. Tapping or scanning the card opens the destination you choose directly in the customer's phone browser.",
      },
      {
        question: "Does it work with iPhone and Android?",
        answer:
          "Yes, with compatible NFC-enabled iPhone and Android devices. The printed QR code works as a fallback where NFC isn't available.",
      },
      {
        question: "Is there a monthly subscription?",
        answer: "No. This is a one-time payment for the physical card — there's no recurring fee.",
      },
      {
        question: "Does the card arrive configured?",
        answer:
          "Yes. We prepare your branded design and configure the card with your chosen destination before dispatch.",
      },
      {
        question: "How do I send my logo?",
        answer:
          "Use the logo upload area on this page when you order. If you'd rather send it another way, add a note in the optional notes field and our team will follow up.",
      },
    ],
  },
];
