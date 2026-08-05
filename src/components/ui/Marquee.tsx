import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  direction?: "left" | "right";
  /** Seconds for one full loop. Lower is faster. */
  speed?: number;
  /** Fade the left/right edges into the section background. */
  fade?: boolean;
};

/**
 * Infinite horizontal marquee built from a single CSS animation.
 *
 * `children` is rendered twice, back to back, so the track can loop by
 * translating exactly -50% with no visible seam. The second copy is
 * `aria-hidden` so assistive tech only announces the content once.
 * Reduced-motion is handled globally in globals.css.
 */
export function Marquee({
  children,
  direction = "left",
  speed = 40,
  fade = true,
  className,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{
        ...(fade
          ? {
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }
          : null),
        ...style,
      }}
      {...props}
    >
      <div
        className={cn(
          "flex w-max",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse",
        )}
        style={{ "--marquee-duration": `${speed}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
