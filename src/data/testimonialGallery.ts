/**
 * Image-based testimonials for the circular gallery layered over the
 * written testimonials on the homepage (`Testimonials` section).
 *
 * Real production photos, stored flat in `public/images/` (not a dedicated
 * `testimonials/` subfolder) — matches how the files were actually
 * supplied. `title` doubles as the accessible label read out for each
 * image (`aria-label`/`role="img"` on its SVG, and the selector button's
 * "Show <title>" label) — it isn't rendered as visible text elsewhere.
 */

export type TestimonialGalleryImage = {
  title: string;
  url: string;
};

export const testimonialGalleryImages: TestimonialGalleryImage[] = [
  { title: "Barbican Pasty", url: "/images/barbicanpasty.png" },
  { title: "Kurdz", url: "/images/kurdz.png" },
  { title: "Red Crow", url: "/images/redcrow.png" },
  { title: "Dino", url: "/images/dino.png" },
  { title: "Margos", url: "/images/margos.png" },
  { title: "Tea & Bun", url: "/images/teaandbun.png" },
  { title: "Hills", url: "/images/hills.png" },
  { title: "Pasta", url: "/images/pasta.png" },
];
