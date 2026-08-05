import { cn } from "@/lib/utils";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-tf-accent/40 bg-tf-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-tf-accent-bright",
        className,
      )}
    >
      {children}
    </span>
  );
}
