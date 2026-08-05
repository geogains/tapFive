/**
 * Partner logos shown in the "Trusted by" marquee on the homepage.
 *
 * PROTOTYPE CONTENT: the six logos below are real, trademarked brand
 * assets used for local design/layout review only — Tap Five has no
 * confirmed partnership with these businesses. Swap this list for
 * genuine, authorised partner logos before the site is deployed publicly.
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
  { name: "Costa Coffee", logoSrc: "/images/costa.png" },
  { name: "Nando's", logoSrc: "/images/nandos.png" },
  { name: "PureGym", logoSrc: "/images/pure-gym.png" },
  { name: "Marriott", logoSrc: "/images/marriot.png" },
  { name: "Premier Inn", logoSrc: "/images/premier-inn.png" },
  { name: "Specsavers", logoSrc: "/images/specsavers.png" },
];
