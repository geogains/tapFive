# Tap Five — Website Template

Tap Five sells physical NFC Google Review cards: a customer taps their phone
against the card and is taken straight to the business's Google review page.

This repository is a **strong starting template**, not a finished ecommerce
site. It's built to be easy to re-theme, re-word and extend — most of the
homepage copy, products and FAQs live in a handful of data files rather than
being scattered through components.

Built with:

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://motion.dev) for scroll-in reveal animations and the mobile nav
- [Lucide React](https://lucide.dev) icons
- ESLint

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Build for production:

```bash
npm run build
npm run start
```

Lint the project:

```bash
npm run lint
```

## The hero image

The homepage hero is a static, full-bleed image with the heading, supporting
copy and CTAs overlaid on top. Two images are used — a wide crop for tablet
and up, and a portrait crop optimised for phones:

```
public/images/hero-image0.png         (tablet and up, md breakpoint and above)
public/images/hero-image-mobile0.png  (mobile, below the md breakpoint)
```

The hero component (`src/components/hero/StaticHero.tsx`) reads both paths
from `src/data/site-content.ts` (`hero.image` / `hero.imageMobile`). Both
images are rendered with `next/image`, and Tailwind's `md:` responsive
classes (`hidden`/`block`) control which one is visually shown at a given
viewport width — a CSS-only swap with no JavaScript involved. Note that
because both `<Image>` elements exist in the DOM, browsers will fetch both
files; each is still individually optimised (resized and served as WebP) by
Next.js, so the cost is small, but it's not a true single-request swap. If
either file is missing, that image falls back to a dark placeholder gradient
instead of a broken image.

Both images are loaded with `fill`, `priority` and `sizes="100vw"` so
they're optimised, not lazy-loaded, and don't contribute to layout shift. A
dark gradient overlay sits above the images to keep the text readable —
kept deliberately light so the photography stays vivid.

> An earlier version of this template used a scroll-scrubbed video hero.
> That component has been removed; `public/videos/tapfive-hero.mp4` is no
> longer referenced anywhere and can be deleted if you don't need it.

The hero has no scroll-linked or entrance animation — it's fully static.

## Logos

The original logo files stay untouched in the project root
(`logo-white.png`, `logo-black.png`). Working copies used by the site live in:

```
public/images/logo-white.png   — used on dark backgrounds
public/images/logo-black.png   — used on light backgrounds
```

The `Logo` component (`src/components/ui/Logo.tsx`) switches between them via
a `variant` prop.

## Where to edit things

This is the short list of files you'll touch most often when customising
the site:

| What | File |
| --- | --- |
| Company info, nav links, hero copy, section headings, testimonials, FAQ intro, CTA copy | `src/data/site-content.ts` |
| Products (name, price, features, images, badges) | `src/data/products.ts` |
| FAQ questions and answers | `src/data/faqs.ts` |
| Colours, accent colour, radius, container width, spacing | `src/app/globals.css` (CSS variables under `:root` and the `@theme inline` block) |
| Hero image source paths | `hero.image` / `hero.imageMobile` in `src/data/site-content.ts` |

Because copy and product/FAQ data are centralised, most day-to-day edits
don't require touching component code at all.

### Colours & theme

All design tokens are defined as CSS variables in `src/app/globals.css`
(prefixed `--tf-*`) and exposed to Tailwind via the `@theme inline` block —
for example `--tf-accent` (the electric-blue accent), `--tf-black`,
`--tf-neutral-*`, `--tf-radius-*` and `--tf-container`. Change the variable
values there and the whole site updates (utility classes like `bg-tf-accent`
or `text-tf-black` read from the same tokens).

## Pages

- `/` — homepage (static hero + all main sections)
- `/products` — full product listing
- `/contact` — presentational contact form
- `/privacy`, `/terms`, `/shipping-returns` — placeholder legal pages

All pages share the same `Header` and `Footer` from the root layout
(`src/app/layout.tsx`).

## Project structure

```
src/
  app/                 Routes (App Router)
  components/
    hero/              StaticHero
    layout/             Header, MobileNav, Footer
    sections/           Homepage sections (BenefitsStrip, HowItWorks, etc.)
    ui/                 Reusable primitives (Button, ProductCard, FAQAccordion, ...)
    forms/              ContactForm
    providers/          MotionProvider (global reduced-motion config)
  data/                 site-content.ts, products.ts, faqs.ts
  hooks/                useScrolledPast
  lib/                  cn() helper, icon registry
```

## Future integration points

This template deliberately stops short of a few things that need real
backend/service decisions:

- **Checkout / payments** — product cards and the products page link to
  `/products` only; no cart or payment flow exists yet. A natural next step
  would be Stripe Checkout or Stripe Elements.
- **Contact form submission** — `src/components/forms/ContactForm.tsx` is
  presentational only. It's clearly marked in code where a real submission
  (an API route, form service, or CRM webhook) should be wired in.
- **CMS** — content currently lives in `src/data/*.ts`. If you outgrow
  hand-editing these files, they're structured so they could be swapped for
  data fetched from a headless CMS with minimal component changes.
- **Real testimonials** — `testimonials` in `src/data/site-content.ts` are
  explicitly labelled placeholders. Replace with real, verified customer
  quotes before launch; don't invent names, businesses or ratings.
- **OG image / favicon** — `src/app/layout.tsx` currently points the Open
  Graph image at the logo as a placeholder, and `src/app/favicon.ico` is the
  default Next.js icon. Swap both for real Tap Five assets before launch.
