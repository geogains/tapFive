import { cn } from "@/lib/utils";

type HowItWorksStepProps = {
  number: string;
  title: string;
  description: string;
  className?: string;
};

export function HowItWorksStep({ number, title, description, className }: HowItWorksStepProps) {
  return (
    <div className={cn("relative flex flex-col gap-5 border-t border-tf-neutral-200 pt-6", className)}>
      <span className="font-display text-sm font-semibold text-tf-accent">{number}</span>
      <h3 className="font-display text-xl font-medium tracking-tight text-tf-black">{title}</h3>
      <p className="text-sm leading-relaxed text-tf-neutral-600">{description}</p>

      {/* Reserved space for a future product photo, mockup or illustration for this step. */}
      <div
        aria-hidden="true"
        className="mt-2 flex aspect-[4/3] w-full items-center justify-center rounded-[var(--tf-radius-md)] border border-dashed border-tf-neutral-300 bg-tf-neutral-100 text-xs text-tf-neutral-400"
      >
        Image placeholder
      </div>
    </div>
  );
}
