import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { company } from "@/data/site-content";

type LogoProps = {
  variant?: "white" | "black";
  className?: string;
  href?: string;
  /** Tailwind height utility controlling the rendered logo size. Defaults to h-11. */
  size?: string;
};

export function Logo({ variant = "white", className, href = "/", size = "h-11" }: LogoProps) {
  const src = variant === "white" ? "/images/logo-white.png" : "/images/logo-black.png";

  return (
    <Link
      href={href}
      className={cn("tf-focus-ring relative flex w-auto items-center", size, className)}
      aria-label={`${company.name} home`}
    >
      <Image
        src={src}
        alt={`${company.name} logo`}
        width={152}
        height={50}
        className={cn("w-auto object-contain", size)}
        priority
      />
    </Link>
  );
}
