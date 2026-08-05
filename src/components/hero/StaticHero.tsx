"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { hero } from "@/data/site-content";

/**
 * Renders a heading line with the word "reviews" set in the heaviest
 * weight the display font (Manrope) supports for strong emphasis;
 * every other word is left unchanged. Manrope's variable font only
 * defines weights 200–800, so font-extrabold (800) — not font-black
 * (900, outside its range) — is the true heaviest weight available.
 */
const HEADLINE_EMPHASIS_WORD = "reviews";

function renderHeadingLine(line: string) {
  const index = line.indexOf(HEADLINE_EMPHASIS_WORD);
  if (index === -1) return line;

  const before = line.slice(0, index);
  const match = line.slice(index, index + HEADLINE_EMPHASIS_WORD.length);
  const after = line.slice(index + HEADLINE_EMPHASIS_WORD.length);

  return (
    <>
      {before}
      <strong className="font-extrabold">{match}</strong>
      {after}
    </>
  );
}

/**
 * Hero background images live at:
 * public/images/hero-image0.png        (tablet and up)
 * public/images/hero-image-mobile0.png (below the md breakpoint)
 *
 * Which one is visible is controlled purely with CSS (Tailwind's
 * `md:` responsive classes) — both are rendered and Next.js optimises
 * each, but only one is ever shown at a given viewport width.
 *
 * If either file is ever removed or renamed, this section falls back to
 * a dark placeholder background instead of a broken image.
 */
export function StaticHero() {
  const [desktopImageError, setDesktopImageError] = useState(false);
  const [mobileImageError, setMobileImageError] = useState(false);

  return (
    <section
      aria-label="Tap Five introduction"
      className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-tf-black pb-24 sm:items-center sm:pb-0"
    >
      {/* Dark placeholder base — visible while the image loads or if it's missing. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_#15171c_0%,_#050608_65%)]"
      />

      {/* Mobile / small-screen image — visible below md, unchanged desktop image at md and up. */}
      {!mobileImageError ? (
        <Image
          src={hero.imageMobile}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="block object-cover object-center md:hidden"
          onError={() => setMobileImageError(true)}
        />
      ) : null}

      {!desktopImageError ? (
        <Image
          src={hero.image}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="hidden object-cover object-center md:block"
          onError={() => setDesktopImageError(true)}
        />
      ) : null}

      {/* Contrast overlay so heading/body text stays readable over the image. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-tf-black/45 via-tf-black/20 to-tf-black/3"
      />
      {/* Extra scrim behind the text column so it reads cleanly regardless of
          what's underneath it in the image; fades out before the right-hand
          side so the rest of the image stays vivid. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-tf-black/20 via-tf-black/8 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[var(--tf-container)] flex-col gap-6 px-6 sm:px-8 lg:px-10">
        <h1 className="font-display max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {hero.headingLines.map((line) => (
            <span key={line} className="block">
              {renderHeadingLine(line)}
            </span>
          ))}
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={hero.primaryCta.href} size="lg">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
