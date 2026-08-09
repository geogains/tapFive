"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * "Tap. Review. Grow." — the homepage's three-stage process explainer.
 *
 * Adapted from a 21st.dev testimonial-carousel component: same oversized
 * index numbering, word-by-word reveal, progress rail, magnetic parallax,
 * autoplay and background ticker, but re-themed for Tap Five and re-purposed
 * to explain the product instead of showing customer quotes. No testimonial
 * concepts (author, role, company) remain.
 *
 * Each slide has its own full-bleed background photo (desktop/mobile pair),
 * so all text in this section is light-on-dark rather than the site's usual
 * dark-on-light — that's intentional and scoped to this component only.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 6000;

const steps = [
  {
    label: "Tap",
    statement: "Customers tap their phone against the card.",
    desktopBackground: "/images/tap-desktop.png",
    mobileBackground: "/images/tap-mobile.png",
  },
  {
    label: "Review",
    statement: "Customers land directly on your Google review page.",
    desktopBackground: "/images/review-desktop.png",
    mobileBackground: "/images/review-mobile.png",
  },
  {
    label: "Grow",
    statement:
      "More reviews build trust, strengthen your reputation and help your business grow.",
    desktopBackground: "/images/grow-desktop.png",
    mobileBackground: "/images/grow-mobile.png",
  },
];

const TICKER_TEXT = steps.map((step) => step.label.toUpperCase()).join(" • ");

export function TapReviewGrow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const numberX = useTransform(springX, [-250, 250], [-16, 16]);
  const numberY = useTransform(springY, [-250, 250], [-8, 8]);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(event.clientX - (rect.left + rect.width / 2));
    mouseY.set(event.clientY - (rect.top + rect.height / 2));
  };

  const goNext = () => setActiveIndex((current) => (current + 1) % steps.length);
  const goPrev = () => setActiveIndex((current) => (current - 1 + steps.length) % steps.length);

  // Re-armed on every activeIndex change, so a manual prev/next click resets
  // the countdown instead of the slide jumping again a moment later — a
  // single timer at a time, always cleared before the next one is scheduled.
  useEffect(() => {
    const timer = setTimeout(goNext, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const current = steps[activeIndex];

  const numberTransition = shouldReduceMotion
    ? { duration: 0.2 }
    : { duration: 0.6, ease: EASE };
  const numberInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.85, filter: "blur(8px)" };
  const numberAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, filter: "blur(0px)" };
  const numberExit = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.08, filter: "blur(8px)" };

  const backgroundTransition = { duration: shouldReduceMotion ? 0.2 : 0.9, ease: EASE };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 18,
      rotateX: shouldReduceMotion ? 0 : 70,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.5,
        delay: shouldReduceMotion ? 0 : i * 0.04,
        ease: EASE,
      },
    }),
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -8,
      transition: { duration: shouldReduceMotion ? 0.1 : 0.2 },
    },
  };

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden bg-tf-black tf-section"
    >
      {/* Slide backgrounds — desktop and mobile assets, crossfading with the active slide. Only one breakpoint's image is ever visible; the hidden one isn't fetched eagerly. */}
      <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
        <AnimatePresence>
          {steps.map(
            (step, i) =>
              i === activeIndex && (
                <motion.div
                  key={step.label}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={backgroundTransition}
                >
                  <Image
                    src={step.desktopBackground}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
      <div aria-hidden="true" className="absolute inset-0 lg:hidden">
        <AnimatePresence>
          {steps.map(
            (step, i) =>
              i === activeIndex && (
                <motion.div
                  key={step.label}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={backgroundTransition}
                >
                  <Image
                    src={step.mobileBackground}
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* Contrast scrim — the supplied images already carry a dark treatment; this only adds the minimum needed to keep text reliably readable across all six (some are notably brighter than others). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-tf-black/40 via-tf-black/10 to-tf-black/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-tf-black/55 via-tf-black/20 to-transparent"
      />

      <Container className="relative z-10">
        <Reveal>
          <div ref={containerRef} onMouseMove={handleMouseMove} className="relative">
            {/* Oversized background index number — decorative, desktop only. */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 select-none font-display text-[14rem] font-bold leading-none tracking-tighter text-white/[0.08] lg:block lg:text-[18rem] xl:text-[20rem]"
              style={{ x: numberX, y: numberY }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeIndex}
                  initial={numberInitial}
                  animate={numberAnimate}
                  exit={numberExit}
                  transition={numberTransition}
                  className="block"
                >
                  {String(activeIndex + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Desktop layout */}
            <div className="relative z-10 hidden lg:flex">
              <div className="flex flex-col items-center justify-center border-r border-white/20 pr-12">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-tf-accent-bright"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  How it works
                </span>

                <div className="relative mt-8 h-32 w-px bg-white/20">
                  <motion.div
                    className="absolute left-0 top-0 w-full origin-top bg-tf-accent-bright"
                    animate={{ height: `${((activeIndex + 1) / steps.length) * 100}%` }}
                    transition={{ duration: shouldReduceMotion ? 0.15 : 0.5, ease: EASE }}
                  />
                </div>
              </div>

              <div className="flex-1 py-4 pl-12 xl:pl-16">
                <AnimatePresence mode="wait">
                  <motion.h3
                    key={activeIndex}
                    initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: shouldReduceMotion ? 0 : 16 }}
                    transition={{ duration: shouldReduceMotion ? 0.15 : 0.4 }}
                    className="font-display mb-4 text-3xl font-bold uppercase tracking-tight text-white xl:text-4xl"
                  >
                    {current.label}
                  </motion.h3>
                </AnimatePresence>

                <div className="relative mb-12 min-h-[4.5rem] xl:min-h-[9.75rem]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeIndex}
                      className="font-display max-w-2xl text-3xl font-medium leading-[1.15] tracking-tight text-white xl:text-[2.75rem]"
                    >
                      {current.statement.split(" ").map((word, i) => (
                        <motion.span
                          key={word + i}
                          custom={i}
                          variants={wordVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="mr-[0.28em] inline-block"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      aria-hidden="true"
                      className="h-px w-8 bg-white/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.15 : 0.6,
                        delay: shouldReduceMotion ? 0 : 0.2,
                      }}
                      style={{ transformOrigin: "left" }}
                    />
                    <span className="font-mono text-sm text-white/60">
                      Step {String(activeIndex + 1).padStart(2, "0")} /{" "}
                      {String(steps.length).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <StepNavButton direction="prev" label="Previous step" onClick={goPrev} />
                    <StepNavButton direction="next" label="Next step" onClick={goNext} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile / tablet layout — deliberately distinct from desktop, not a shrink. */}
            <div className="relative z-10 flex flex-col gap-6 lg:hidden">
              <div className="relative pt-14 sm:pt-16">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-4 left-0 select-none font-display text-[6rem] font-bold leading-none tracking-tighter text-white/[0.12] sm:text-[7rem]"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeIndex}
                      initial={numberInitial}
                      animate={numberAnimate}
                      exit={numberExit}
                      transition={numberTransition}
                      className="block"
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="relative flex flex-col gap-3">
                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={activeIndex}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
                      transition={{ duration: shouldReduceMotion ? 0.15 : 0.35 }}
                      className="font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl"
                    >
                      {current.label}
                    </motion.h3>
                  </AnimatePresence>

                  <div className="relative min-h-[8.5rem] sm:min-h-[5.25rem]">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activeIndex}
                        className="font-display text-2xl font-medium leading-snug tracking-tight text-white sm:text-3xl"
                      >
                        {current.statement.split(" ").map((word, i) => (
                          <motion.span
                            key={word + i}
                            custom={i}
                            variants={wordVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mr-[0.25em] inline-block"
                          >
                            {word}
                          </motion.span>
                        ))}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2" role="presentation">
                  {steps.map((step, i) => (
                    <span
                      key={step.label}
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === activeIndex ? "w-6 bg-tf-accent-bright" : "w-1.5 bg-white/25",
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <StepNavButton direction="prev" label="Previous step" onClick={goPrev} />
                  <StepNavButton direction="next" label="Next step" onClick={goNext} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bottom ticker — subtle, decorative, TAP / REVIEW / GROW. */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative mt-16 overflow-hidden opacity-[0.18] lg:mt-24"
        >
          <motion.div
            className="flex whitespace-nowrap font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            animate={shouldReduceMotion ? undefined : { x: [0, -1000] }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
            }
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="mx-6">
                {TICKER_TEXT} •
              </span>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function StepNavButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2, ease: EASE }}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/[0.03] text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/10 lg:h-12 lg:w-12"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </motion.button>
  );
}
