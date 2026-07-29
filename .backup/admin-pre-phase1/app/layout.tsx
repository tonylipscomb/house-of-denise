import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/commerce/CartProvider";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteMetadata } from "@/lib/metadata";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.defaultTitle,
    template: siteMetadata.titleTemplate
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.defaultTitle,
    description: siteMetadata.description,
    siteName: "House Of Denise",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.defaultTitle,
    description: siteMetadata.description
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <CartProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
