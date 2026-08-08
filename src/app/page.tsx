import type { Metadata } from "next";
import { StaticHero } from "@/components/hero/StaticHero";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { WhyTapFive } from "@/components/sections/WhyTapFive";
import { BusinessTypes } from "@/components/sections/BusinessTypes";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Tap Five | NFC Google Review Cards for Local Businesses",
  description:
    "Tap Five designs premium NFC Google Review cards. One tap takes customers straight to your Google review page, no app required.",
};

export default function Home() {
  return (
    <div id="home">
      <StaticHero />
      <TrustedBy />
      <ProductsSection />
      <HowItWorks />
      <WhyTapFive />
      <BusinessTypes />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </div>
  );
}
