import { createElement } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getIcon } from "@/lib/icon-map";
import { businessTypes, businessTypesSection } from "@/data/site-content";

export function BusinessTypes() {
  return (
    <section className="bg-tf-white tf-section">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={businessTypesSection.eyebrow}
          heading={businessTypesSection.heading}
          supporting={businessTypesSection.supporting}
          align="center"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {businessTypes.map((type, index) => (
            <Reveal key={type.name} delay={index * 0.05}>
              <div className="flex flex-col items-center gap-3 rounded-[var(--tf-radius-md)] border border-tf-neutral-200 bg-tf-paper px-4 py-8 text-center transition-colors hover:border-tf-accent/40">
                {createElement(getIcon(type.icon), { className: "h-6 w-6 text-tf-accent", "aria-hidden": true })}
                <span className="text-sm font-medium text-tf-black">{type.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
