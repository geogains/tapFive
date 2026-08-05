import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { partners, type Partner } from "@/data/partners";

function PartnerLogo({ partner }: { partner: Partner }) {
  const content = partner.logoSrc ? (
    <Image
      src={partner.logoSrc}
      alt={`${partner.name} logo`}
      width={182}
      height={60}
      className="h-10 w-auto object-contain opacity-60 grayscale transition-opacity duration-300 group-hover/logo:opacity-100 sm:h-11"
    />
  ) : (
    <span className="font-display text-lg font-medium tracking-tight text-tf-neutral-400 transition-colors duration-300 group-hover/logo:text-tf-white sm:text-xl">
      {partner.name}
    </span>
  );

  if (!partner.href) {
    return (
      <div className="group/logo flex h-11 items-center sm:h-12">{content}</div>
    );
  }

  return (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/logo tf-focus-ring flex h-11 items-center sm:h-12"
    >
      {content}
    </a>
  );
}

/**
 * Sits directly beneath the hero on a dark background, taking the place
 * of the old four-feature strip so the transition from the hero into the
 * rest of the page still feels intentional rather than an abrupt cut.
 */
export function TrustedBy() {
  return (
    <section className="overflow-hidden bg-tf-black pb-10 sm:pb-12">
      <Container>
        <h2 className="text-center font-display text-2xl font-medium tracking-tight text-tf-white sm:text-3xl">
          Trusted by
        </h2>
      </Container>

      <Marquee speed={42} className="mt-10 sm:mt-12">
        {partners.map((partner) => (
          <div key={partner.name} className="mx-8 flex shrink-0 items-center sm:mx-12">
            <PartnerLogo partner={partner} />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
