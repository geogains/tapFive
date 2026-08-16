"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { testimonialGalleryImages, type TestimonialGalleryImage } from "@/data/testimonialGallery";
import { cn } from "@/lib/utils";

// Registered once, at module scope. Guarded for SSR: this module is only
// ever imported by "use client" components, but Next.js still evaluates
// client-component modules during the server render pass for the initial
// HTML, where `window` doesn't exist.
if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

const AUTOPLAY_INTERVAL_MS = 4500;

/**
 * Adapted from the 21st.dev "circular image gallery" demo for the Tap
 * Five homepage (image-based testimonials, layered over the written
 * testimonials section). Two things changed from the original beyond
 * visual sizing:
 *
 *  - GSAP + MotionPathPlugin are imported as a normal npm dependency
 *    (already used nowhere else in the app) instead of injected from a
 *    CDN at runtime — faster, doesn't depend on a third-party script host
 *    being reachable, and gives this file real TypeScript types.
 *  - The gallery no longer owns a full-viewport wrapper (`min-h-screen`,
 *    `bg-primary`). It renders just the gallery block, sized responsively
 *    against its parent's width rather than `vmin`, so the section that
 *    renders it (`Testimonials`) controls the surrounding layout.
 *
 * The circular-reveal SVG animation itself (clip-path circle → square,
 * `MotionPathPlugin` bounce into the resting "tab" position) is otherwise
 * unchanged from the source.
 */
export function ImageGallery() {
  const images = testimonialGalleryImages;
  const [opened, setOpened] = useState(0);
  const [inPlace, setInPlace] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const autoplayTimer = useRef<number | null>(null);

  const onClick = (index: number) => {
    if (!disabled) setOpened(index);
  };

  const onInPlace = (index: number) => setInPlace(index);

  const next = useCallback(() => {
    setOpened((currentOpened) => {
      let nextIndex = currentOpened + 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
  }, [images.length]);

  const prev = useCallback(() => {
    setOpened((currentOpened) => {
      let prevIndex = currentOpened - 1;
      if (prevIndex < 0) prevIndex = images.length - 1;
      return prevIndex;
    });
  }, [images.length]);

  // Intentional: locks navigation for the duration of the open/settle
  // animation (unlocked below once `inPlace` confirms it actually
  // finished) — not something derivable during render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDisabled(true), [opened]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDisabled(false), [inPlace]);

  // Autoplay — recreated every time `opened` changes, so any manual
  // interaction (arrow click or selector click, which also updates
  // `opened`) naturally resets the countdown rather than firing on top of
  // a fresh manual navigation.
  useEffect(() => {
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    autoplayTimer.current = window.setInterval(next, AUTOPLAY_INTERVAL_MS);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [opened, next]);

  return (
    <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[640px]">
      {/*
        Ambient glow: desktop-only (matches the gallery's own `lg` cap, since
        it never grows past 640px beyond that breakpoint). Reuses the same
        `opened` index the carousel already tracks — no duplicated state, no
        events. Each image gets its own stacked, blurred, desaturated,
        white-washed layer that simply crossfades via CSS opacity/transition
        when `opened` changes; the radial-gradient mask fades the whole box
        out before its own rectangular edges, so it reads as a soft halo
        rather than a blurred rectangle. Sits earlier in the DOM (and so
        behind, via normal paint order) than the actual gallery box below,
        with no z-index needed.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[150%] w-[170%] -translate-x-1/2 -translate-y-1/2 lg:block"
        style={{
          maskImage: "radial-gradient(closest-side, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(closest-side, black 30%, transparent 100%)",
        }}
      >
        {images.map((image, i) => (
          <div
            key={image.url}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{
              opacity: opened === i ? 1 : 0,
              backgroundImage: `url(${image.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(70px) saturate(0.55) brightness(1.1)",
              transform: "scale(1.15)",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-white/55" />
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-tf-neutral-200 shadow-[0_2.8px_2.2px_rgba(0,0,0,0.03),0_6.7px_5.3px_rgba(0,0,0,0.04),0_12.5px_10px_rgba(0,0,0,0.05),0_22.3px_17.9px_rgba(0,0,0,0.06),0_41.8px_33.4px_rgba(0,0,0,0.07),0_100px_80px_rgba(0,0,0,0.09)]">
        {images.map((image, i) => (
          <div
            key={image.url}
            className="absolute left-0 top-0 h-full w-full"
            style={{ zIndex: inPlace === i ? i : images.length + 1 }}
          >
            <GalleryImage
              total={images.length}
              id={i}
              url={image.url}
              title={image.title}
              open={opened === i}
              inPlace={inPlace === i}
              onInPlace={onInPlace}
            />
          </div>
        ))}

        <div className="pointer-events-none absolute left-0 top-0 z-[100] h-full w-full">
          <Tabs images={images} activeIndex={opened} onSelect={onClick} />
        </div>
      </div>

      {/*
        Positioned relative to this gallery's own wrapper (not the
        viewport) — on narrow screens the buttons sit just inside the
        image edge (never past it, so they can never push the page wider
        than the viewport); from `sm` up, where there's comfortable margin
        on either side within the surrounding Container, they float
        slightly outside the image for the more usual "floating arrow"
        look.
      */}
      <button
        type="button"
        className="tf-focus-ring absolute left-1 top-1/2 z-[101] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/20 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:border-white/40 hover:bg-white hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:-left-4 sm:h-14 sm:w-14 lg:-left-6"
        onClick={prev}
        disabled={disabled}
        aria-label="Previous Image"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-tf-black sm:h-7 sm:w-7"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        className="tf-focus-ring absolute right-1 top-1/2 z-[101] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/20 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:border-white/40 hover:bg-white hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:-right-4 sm:h-14 sm:w-14 lg:-right-6"
        onClick={next}
        disabled={disabled}
        aria-label="Next Image"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-tf-black sm:h-7 sm:w-7"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

type GalleryImageProps = {
  url: string;
  title: string;
  open: boolean;
  inPlace: boolean;
  id: number;
  onInPlace: (id: number) => void;
  total: number;
};

function GalleryImage({ url, title, open, inPlace, id, onInPlace, total }: GalleryImageProps) {
  const firstLoad = useRef(true);
  const clip = useRef<SVGCircleElement>(null);

  const gap = 10;
  const circleRadius = 7;
  const defaults = { transformOrigin: "center center" };
  const duration = 0.4;
  const width = 400;
  const height = 400;
  const scale = 700;

  // Not every testimonial photo is a perfect square, and the sharp foreground
  // image below is deliberately "contain"-fit (no cropping/stretching of
  // people, faces, cards, etc). That leaves empty space on the shorter axis
  // for non-square photos. Instead of showing flat container background
  // there, this same image is rendered again underneath — cover-cropped,
  // blurred, oversized (`frostScale`) so the blur's soft edge falls well
  // outside the visible 0-400 viewBox rather than fringing at the boundary,
  // and lightly tinted for a frosted-glass feel.
  const frostScale = 1.45;
  const frostSize = width * frostScale;
  const frostOffset = (width - frostSize) / 2;

  const bigSize = circleRadius * scale;
  const overlap = 0;

  const getPosSmall = () => ({
    cx: width / 2 - (total * (circleRadius * 2 + gap) - gap) / 2 + id * (circleRadius * 2 + gap),
    cy: height - 30,
    r: circleRadius,
  });

  const getPosSmallAbove = () => ({
    cx: width / 2 - (total * (circleRadius * 2 + gap) - gap) / 2 + id * (circleRadius * 2 + gap),
    cy: height / 2,
    r: circleRadius * 2,
  });

  const getPosCenter = () => ({ cx: width / 2, cy: height / 2, r: circleRadius * 7 });
  const getPosEnd = () => ({ cx: width / 2 - bigSize + overlap, cy: height / 2, r: bigSize });
  const getPosStart = () => ({ cx: width / 2 + bigSize - overlap, cy: height / 2, r: bigSize });

  useEffect(() => {
    if (!clip.current) return;

    const isFirstLoad = firstLoad.current;
    firstLoad.current = false;

    const flipDuration = isFirstLoad ? 0 : duration;
    const upDuration = isFirstLoad ? 0 : 0.2;
    const bounceDuration = isFirstLoad ? 0.01 : 1;
    const delay = isFirstLoad ? 0 : flipDuration + upDuration;

    if (open) {
      gsap
        .timeline()
        .set(clip.current, { ...defaults, ...getPosSmall() })
        .to(clip.current, { ...defaults, ...getPosCenter(), duration: upDuration, ease: "power3.inOut" })
        .to(clip.current, {
          ...defaults,
          ...getPosEnd(),
          duration: flipDuration,
          ease: "power4.in",
          onComplete: () => onInPlace(id),
        });
    } else {
      gsap
        .timeline({ overwrite: true })
        .set(clip.current, { ...defaults, ...getPosStart() })
        .to(clip.current, { ...defaults, ...getPosCenter(), delay, duration: flipDuration, ease: "power4.out" })
        .to(clip.current, {
          ...defaults,
          motionPath: { path: [getPosSmallAbove(), getPosSmall()], curviness: 1 },
          duration: bounceDuration,
          ease: "bounce.out",
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- position helpers are recomputed fresh each run; only `open` should retrigger the timeline.
  }, [open]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label={title}
    >
      <defs>
        <clipPath id={`${id}_circleClip`}>
          <circle className="clip" cx="0" cy="0" r={circleRadius} ref={clip} />
        </clipPath>
        <clipPath id={`${id}_squareClip`}>
          <rect className="clip" width={width} height={height} />
        </clipPath>
        <filter id={`${id}_frostBlur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <g clipPath={`url(#${id}${inPlace ? "_squareClip" : "_circleClip"})`}>
        {/* Frosted background fill: same photo, cover-cropped oversized, blurred, and lightly
            tinted so it reads as soft glass rather than a visibly duplicated image. */}
        <image
          x={frostOffset}
          y={frostOffset}
          width={frostSize}
          height={frostSize}
          href={url}
          preserveAspectRatio="xMidYMid slice"
          filter={`url(#${id}_frostBlur)`}
          className="pointer-events-none"
        />
        <rect width={width} height={height} fill="white" fillOpacity="0.16" className="pointer-events-none" />

        {/* Sharp foreground: "contain"-fit so real photos (people, faces, cards, signage)
            never stretch or crop — this is the design's actual subject. */}
        <image
          width={width}
          height={height}
          href={url}
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none"
        />
      </g>
    </svg>
  );
}

type TabsProps = {
  images: TestimonialGalleryImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

function Tabs({ images, activeIndex, onSelect }: TabsProps) {
  const gap = 10;
  const circleRadius = 7;
  const width = 400;
  const height = 400;

  const getPosX = (i: number) =>
    width / 2 - (images.length * (circleRadius * 2 + gap) - gap) / 2 + i * (circleRadius * 2 + gap);
  const getPosY = () => height - 30;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      {images.map((image, i) => (
        // Active state is communicated by scale alone (no ring/outline/glow): `transform-box:
        // fill-box` + `origin-center` scale this group around its own fixed centre, so the dot
        // grows in place without nudging its neighbours or shifting the row.
        <g
          key={image.url}
          className={cn(
            "pointer-events-auto origin-center transition-transform duration-200 ease-out [transform-box:fill-box]",
            activeIndex === i ? "scale-[1.06]" : "scale-100",
          )}
        >
          <defs>
            <clipPath id={`tab_${i}_clip`}>
              <circle cx={getPosX(i)} cy={getPosY()} r={circleRadius} />
            </clipPath>
          </defs>

          <image
            x={getPosX(i) - circleRadius}
            y={getPosY() - circleRadius}
            width={circleRadius * 2}
            height={circleRadius * 2}
            href={image.url}
            clipPath={`url(#tab_${i}_clip)`}
            className="pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          />

          <circle
            onClick={() => onSelect(i)}
            className="cursor-pointer fill-white/0 stroke-white/70 outline-none transition-all hover:stroke-white"
            strokeWidth="2"
            cx={getPosX(i)}
            cy={getPosY()}
            r={circleRadius + 2}
            role="button"
            tabIndex={0}
            aria-label={`Show ${image.title}`}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(i);
              }
            }}
          />
        </g>
      ))}
    </svg>
  );
}
