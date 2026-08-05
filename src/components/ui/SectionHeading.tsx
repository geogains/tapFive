import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  heading: string;
  supporting?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  supporting,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        isCenter && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            isDark ? "text-tf-accent-bright" : "text-tf-accent",
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.75rem]",
          isDark ? "text-tf-white" : "text-tf-black",
        )}
      >
        {heading}
      </h2>
      {supporting ? (
        <p
          className={cn(
            "text-base leading-relaxed sm:text-lg",
            isDark ? "text-tf-neutral-300" : "text-tf-neutral-600",
          )}
        >
          {supporting}
        </p>
      ) : null}
    </div>
  );
}
