/**
 * Central content file for the Tap Five website template.
 *
 * Almost all editable copy lives here so the site can be re-worded
 * without touching component code. Product data lives in `products.ts`
 * and FAQ data lives in `faqs.ts`.
 */

export const company = {
  name: "Tap Five",
  legalName: "Tap Five Ltd",
  tagline: "NFC Google Review cards for local businesses",
  description:
    "Tap Five designs premium NFC review cards that turn a single tap into a genuine Google review — no app, no typing a link, no friction.",
  email: "hello@tapfive.co.uk",
  phone: "+44 (0)20 7946 0000",
  address: "London, United Kingdom",
  foundedYear: 2025,
};

export const nav = [
  { label: "Home", href: "/#home" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Products", href: "/#products" },
  { label: "Why Tap Five", href: "/#why-tap-five" },
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
    { label: "Counter Review Card", href: "/products#counter-review-card" },
    { label: "Review Stand", href: "/products#review-stand" },
    { label: "Custom-Branded Card", href: "/products#custom-branded-card" },
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

export const howItWorks = {
  eyebrow: "How it works",
  heading: "Three steps to more reviews",
  supporting:
    "Tap Five is designed to fit naturally into a customer's visit, with no extra steps for your team.",
  steps: [
    {
      number: "01",
      title: "Place the card",
      description:
        "Position your Tap Five card at your counter, table or reception area, wherever customers naturally pause.",
    },
    {
      number: "02",
      title: "The customer taps",
      description:
        "Using any NFC-enabled smartphone, the customer holds their phone near the card for a moment.",
    },
    {
      number: "03",
      title: "They land on your review page",
      description:
        "The tap opens their browser directly on your Google review page, ready for them to share their feedback.",
    },
  ],
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

export const businessTypesSection = {
  eyebrow: "Who it's for",
  heading: "Built for businesses that meet customers face to face",
  supporting:
    "Tap Five works anywhere a happy customer pauses for a moment, edit this list to match the industries you serve.",
};

export const businessTypes = [
  { name: "Barbers", icon: "Scissors" },
  { name: "Salons", icon: "Sparkles" },
  { name: "Restaurants", icon: "UtensilsCrossed" },
  { name: "Cafés", icon: "Coffee" },
  { name: "Tradespeople", icon: "Hammer" },
  { name: "Dentists", icon: "Stethoscope" },
  { name: "Gyms", icon: "Dumbbell" },
  { name: "Hotels", icon: "BedDouble" },
];

/**
 * Testimonials are placeholder content only.
 * Replace `quote`, `name` and `role` with real, verified customer
 * testimonials before launch. Do not invent names, businesses,
 * star ratings or statistics.
 */
export const testimonialsSection = {
  eyebrow: "Social proof",
  heading: "What businesses could say about Tap Five",
  supporting:
    "This section is reserved for real customer testimonials — replace the placeholders below once feedback is collected.",
};

export const testimonials = [
  {
    quote: "Customer testimonial placeholder — replace with a real quote once available.",
    name: "Business name placeholder",
    role: "Business owner",
  },
  {
    quote: "Customer testimonial placeholder — replace with a real quote once available.",
    name: "Business name placeholder",
    role: "Manager",
  },
  {
    quote: "Customer testimonial placeholder — replace with a real quote once available.",
    name: "Business name placeholder",
    role: "Business owner",
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
    updated: "This is placeholder content for template purposes only.",
  },
  terms: {
    heading: "Terms & Conditions",
    updated: "This is placeholder content for template purposes only.",
  },
  shipping: {
    heading: "Shipping & Returns",
    updated: "This is placeholder content for template purposes only.",
  },
};
