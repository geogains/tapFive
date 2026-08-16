import Link from "next/link";
import { Camera, Music2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { company, footerNav, socials } from "@/data/site-content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-tf-black text-white">
      <Container className="tf-section">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Logo variant="white" />
            <p className="max-w-xs text-sm leading-relaxed text-tf-neutral-400">
              {company.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tap Five on Instagram"
                className="tf-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--tf-radius-sm)] border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Camera className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tap Five on TikTok"
                className="tf-focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--tf-radius-sm)] border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
              >
                <Music2 className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <FooterColumn heading="Company" links={footerNav.company} />
          <FooterColumn heading="Products" links={footerNav.products} />

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="flex flex-col gap-2 text-sm text-tf-neutral-400">
              <li>{company.email}</li>
              <li>
                <Link
                  href="/contact"
                  className="tf-focus-ring text-sm text-tf-neutral-400 transition-colors hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-tf-neutral-500">
            © {year} {company.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerNav.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="tf-focus-ring text-xs text-tf-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-white">{heading}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="tf-focus-ring text-sm text-tf-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
