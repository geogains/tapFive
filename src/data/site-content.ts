/**
 * Central content file for the Tap Five website template.
 *
 * Almost all editable copy lives here so the site can be re-worded
 * without touching component code. Product data lives in `products.ts`
 * and FAQ data lives in `faqs.ts`.
 */

export const company = {
  name: "Tap Five",
  /** Tap Five trades as a sole trader — there is no separate limited company, so this is never "Tap Five Ltd". */
  legalName: "Tap Five",
  tagline: "NFC Google Review cards for local businesses",
  description:
    "Tap Five designs premium NFC review cards that turn a single tap into a genuine Google review — no app, no typing a link, no friction.",
  email: "info@tapfive.co.uk",
  foundedYear: 2025,
};

export const nav = [
  { label: "Home", href: "/#home" },
  { label: "Products", href: "/#products" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Why Tap Five", href: "/#why-tap-five" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  company: [
    { label: "Home", href: "/#home" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Why Tap Five", href: "/#why-tap-five" },
    { label: "FAQ", href: "/#faq" },
  ],
  products: [
    { label: "All Products", href: "/products" },
    { label: "Google Review Card", href: "/products#counter-review-card" },
    { label: "Instagram Follow Card", href: "/products#review-stand" },
    { label: "Custom Branded Card", href: "/products#custom-branded-card" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Shipping & Returns", href: "/shipping-returns" },
  ],
};

export const socials = {
  instagram: "https://instagram.com/tapfive", // placeholder — update with real handle
  tiktok: "https://tiktok.com/@tapfive", // placeholder — update with real handle
};

export const hero = {
  headingLines: ["The smarter", "way to get", "more reviews."],
  primaryCta: { label: "Shop Google Review Cards", href: "/products" },
  secondaryCta: { label: "See How It Works", href: "/#how-it-works" },
  image: "/images/hero-image0.png",
  imageMobile: "/images/hero-image-mobile0.png",
};

export const productsSection = {
  eyebrow: "Products",
  heading: "Designed to sit beautifully in your space",
  supporting:
    "Every Tap Five product is built around the same simple idea: make it effortless for a happy customer to leave a review.",
  viewAllCta: { label: "View All Products", href: "/products" },
};

export const whyTapFive = {
  eyebrow: "Why Tap Five",
  heading: "A better way to ask for reviews",
  supporting:
    "Tap Five is built around the practical realities of running a local business — busy counters, quick interactions and customers who want to help but rarely go out of their way to do it.",
  points: [
    {
      title: "Make asking feel natural",
      description:
        "A card on the counter is a gentle, low-pressure prompt rather than an awkward ask from staff.",
      icon: "MessageCircleHeart",
    },
    {
      title: "Fewer steps to feedback",
      description:
        "Removing the need to search for your business or copy a link means more customers actually follow through.",
      icon: "MousePointerClick",
    },
    {
      title: "Build stronger local trust",
      description:
        "A steady flow of genuine feedback helps new customers understand what it's like to work with you.",
      icon: "Handshake",
    },
    {
      title: "A smoother collection process",
      description:
        "Replace handwritten signs and spoken requests with one consistent, professional touchpoint.",
      icon: "ListChecks",
    },
    {
      title: "A more professional experience",
      description:
        "A well-designed card reflects the same care and attention you put into your product or service.",
      icon: "Sparkles",
    },
  ],
};

export const testimonialsSection = {
  eyebrow: "Social proof",
  heading: "What businesses say about Tap Five",
  supporting: "Real feedback from local businesses using Tap Five to collect more Google reviews.",
};

export const testimonials = [
  {
    quote:
      "We started seeing more Google reviews almost immediately. Customers understand exactly what to do, and it takes them seconds.",
    name: "Harvey",
    role: "Manager, Oakline Motors",
  },
  {
    quote:
      "Such a simple idea, but it works. We leave the card by the till and customers tap it while they're paying. Our review numbers have definitely picked up.",
    name: "Amir",
    role: "Owner, North & Bean Café",
  },
  {
    quote:
      "The setup was completely handled for us. The card arrived ready to use and we've already had customers leaving reviews through it.",
    name: "Sanjay",
    role: "Owner, The Sweet Pantry",
  },
  {
    quote:
      "Before this, we'd ask customers for reviews and most would forget by the time they got home. Now they can do it there and then.",
    name: "Mohammed",
    role: "Manager, Ember Kitchen",
  },
  {
    quote:
      "It looks professional on the counter and makes asking for reviews much less awkward. Customers just tap their phone and it opens straight away.",
    name: "Priya",
    role: "Store Manager, Aurelia Jewellers",
  },
  {
    quote:
      "We've had a really positive response from customers. There's no app to download or anything complicated — one tap and they're on our review page.",
    name: "Jay",
    role: "Owner, The Dessert Room",
  },
  {
    quote:
      "Getting more reviews was something we kept putting off. Tap Five made the whole process simple and now it just happens naturally during service.",
    name: "Raj",
    role: "Restaurant Manager, Saffron Table",
  },
  {
    quote:
      "The card fits perfectly at our checkout. It's a small addition to the shop, but it gives customers a much easier way to support the business.",
    name: "Simran",
    role: "Owner, Willow & Thread",
  },
  {
    quote:
      "Really impressed with how straightforward it is. We've been able to turn happy customers into Google reviews without having to constantly remind people.",
    name: "Daniel",
    role: "General Manager, Junction Coffee Co.",
  },
];

export const faqSection = {
  eyebrow: "FAQ",
  heading: "Frequently asked questions",
  supporting: "Can't find what you're looking for? Get in touch and we'll help directly.",
};

export const finalCta = {
  heading: "Make every customer interaction count.",
  supporting:
    "Give satisfied customers a faster, simpler way to share their experience.",
  primaryCta: { label: "Shop Review Cards", href: "/products" },
  secondaryCta: { label: "Contact Tap Five", href: "/contact" },
};

export const contactPage = {
  eyebrow: "Contact",
  heading: "Talk to Tap Five",
  supporting:
    "Have a question about products, orders or custom branding? Send a message and we'll get back to you.",
};

export const legalPages = {
  privacy: {
    heading: "Privacy Policy",
    updated: "Last updated: 11 August 2026",
  },
  terms: {
    heading: "Terms & Conditions",
    updated: "Last updated: 11 August 2026",
  },
  // Not part of this update — src/app/shipping-returns/page.tsx remains a
  // placeholder pending real dispatch/delivery/returns policy content.
  shipping: {
    heading: "Shipping & Returns",
    updated: "This is placeholder content for template purposes only.",
  },
};
