import { createElement } from "react";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

type BenefitItemProps = {
  icon: string;
  title: string;
  description: string;
  tone?: "light" | "dark";
  className?: string;
};

export function BenefitItem({ icon, title, description, tone = "light", className }: BenefitItemProps) {
  const isDark = tone === "dark";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-[var(--tf-radius-sm)] border",
          isDark
            ? "border-white/15 bg-white/5 text-tf-accent-bright"
            : "border-tf-neutral-200 bg-tf-neutral-100 text-tf-accent",
        )}
      >
        {createElement(getIcon(icon), { className: "h-5 w-5", "aria-hidden": true })}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className={cn("text-base font-semibold tracking-tight", isDark ? "text-tf-white" : "text-tf-black")}>
          {title}
        </h3>
        <p className={cn("text-sm leading-relaxed", isDark ? "text-tf-neutral-400" : "text-tf-neutral-600")}>
          {description}
        </p>
      </div>
    </div>
  );
}
