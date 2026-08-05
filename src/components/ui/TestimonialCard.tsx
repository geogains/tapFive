import { Quote } from "lucide-react";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
};

export function TestimonialCard({ quote, name, role }: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col justify-between gap-8 rounded-[var(--tf-radius-lg)] border border-tf-neutral-200 bg-tf-white p-8">
      <Quote className="h-6 w-6 text-tf-accent" aria-hidden="true" />
      <blockquote>
        <p className="text-base leading-relaxed text-tf-neutral-700">{quote}</p>
      </blockquote>
      <figcaption className="flex flex-col">
        <span className="text-sm font-semibold text-tf-black">{name}</span>
        <span className="text-sm text-tf-neutral-500">{role}</span>
      </figcaption>
    </figure>
  );
}
