import Image from "next/image";
import { cn } from "@/lib/utils";

type HowItWorksStepProps = {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  className?: string;
};

export function HowItWorksStep({ number, title, description, image, imageAlt, className }: HowItWorksStepProps) {
  return (
    <div className={cn("relative flex flex-col gap-5 border-t border-tf-neutral-200 pt-6", className)}>
      <span className="font-display text-sm font-semibold text-tf-accent">{number}</span>
      <h3 className="font-display text-xl font-medium tracking-tight text-tf-black">{title}</h3>
      <p className="text-sm leading-relaxed text-tf-neutral-600">{description}</p>

      <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-[var(--tf-radius-md)] bg-tf-neutral-100">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 640px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
