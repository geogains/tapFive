import { Container } from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow?: string;
  heading: string;
  supporting?: string;
};

export function PageHero({ eyebrow, heading, supporting }: PageHeroProps) {
  return (
    <section className="bg-tf-black pb-16 pt-[calc(var(--tf-header-height)+3rem)] sm:pb-20 sm:pt-[calc(var(--tf-header-height)+4rem)]">
      <Container className="flex flex-col gap-4">
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-tf-accent-bright">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-display max-w-2xl text-4xl font-medium tracking-tight text-white sm:text-5xl">
          {heading}
        </h1>
        {supporting ? (
          <p className="max-w-xl text-base leading-relaxed text-tf-neutral-300 sm:text-lg">
            {supporting}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
