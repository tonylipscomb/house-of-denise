import type { Metadata } from "next";
import { brand } from "@/data/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://houseofdenise.com";

export const siteMetadata = {
  titleTemplate: `%s | ${brand.name}`,
  defaultTitle: `${brand.name} | ${brand.tagline}`,
  description: brand.description,
  siteUrl
};

export function createPageMetadata({
  title,
  description,
  path = "",
  image
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const pageDescription = description ?? brand.description;
  const url = `${siteUrl}${path}`;
  const imageUrl = image ? new URL(image, siteUrl).toString() : undefined;

  return {
    title,
    description: pageDescription,
    openGraph: {
      title: `${title} | ${brand.name}`,
      description: pageDescription,
      url,
      images: imageUrl ? [{ url: imageUrl, alt: `${brand.name} fragrance experience` }] : undefined,
      siteName: brand.name,
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${brand.name}`,
      description: pageDescription,
      images: imageUrl ? [imageUrl] : undefined
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: true,
      follow: true
    }
  };
}
