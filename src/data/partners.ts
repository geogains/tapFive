/**
 * Partner logos shown in the "Trusted by" marquee on the homepage.
 *
 * These 9 fictional brands mirror the businesses quoted in the
 * testimonials section (`src/data/site-content.ts`), so the two sections
 * feel consistent rather than referencing different sets of businesses.
 *
 * To add or replace an entry: set `name` to the company name and
 * `logoSrc` to an image placed in `public/images/` (SVG or PNG with a
 * transparent background works best). `href` is optional and, if set,
 * links the logo out to the partner's website. Until `logoSrc` is set,
 * the partner renders as a text wordmark instead of an image.
 */

export type Partner = {
  name: string;
  logoSrc?: string;
  href?: string;
};

export const partners: Partner[] = [
  { name: "Oakline Motors", logoSrc: "/images/tea&bun.png" },
  { name: "North & Bean Café", logoSrc: "/images/north2.png" },
  { name: "The Sweet Pantry", logoSrc: "/images/redcrow1.png" },
  { name: "Ember Kitchen", logoSrc: "/images/ember2.png" },
  { name: "Aurelia Jewellers", logoSrc: "/images/aureila2.png" },
  { name: "The Dessert Room", logoSrc: "/images/cakebox.png" },
  { name: "Saffron Table", logoSrc: "/images/saffron2.png" },
  { name: "Junction Coffee Co.", logoSrc: "/images/junction2.png" },
];
