import { Check } from "lucide-react";

export function ProductBenefits({ benefits }: { benefits: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {benefits.map((benefit) => (
        <li key={benefit} className="flex items-start gap-2.5 text-sm text-tf-neutral-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-tf-accent" aria-hidden="true" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  );
}
