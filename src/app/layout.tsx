import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { company } from "@/data/site-content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://tapfive.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tap Five | NFC Google Review Cards for Local Businesses",
    template: "%s | Tap Five",
  },
  description: company.description,
  keywords: [
    "NFC review card",
    "Google review card",
    "NFC business card",
    "review collection",
    "Tap Five",
  ],
  openGraph: {
    title: "Tap Five | NFC Google Review Cards for Local Businesses",
    description: company.description,
    url: siteUrl,
    siteName: company.name,
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/images/preview.png",
        width: 1672,
        height: 941,
        alt: "Tap Five",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tap Five | NFC Google Review Cards for Local Businesses",
    description: company.description,
    images: ["/images/preview.png"],
  },
  icons: {
    icon: "/images/tapfive-favicon.png",
    shortcut: "/images/tapfive-favicon.png",
    apple: "/images/tapfive-favicon.png",
  },
};

export const viewport = {
  themeColor: "#050608",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${manrope.variable}`}>
      <body className="bg-tf-white text-tf-black antialiased">
        <MotionProvider>
          <CartProvider>
            <a
              href="#main-content"
              className="tf-focus-ring sr-only z-[100] bg-tf-white px-4 py-2 text-sm font-medium text-tf-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              Skip to content
            </a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
