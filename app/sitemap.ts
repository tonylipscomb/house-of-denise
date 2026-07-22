import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/metadata";

const routes = [
  "",
  "/shop",
  "/experiences",
  "/workshops",
  "/perfume-bar",
  "/private-events",
  "/our-story",
  "/contact",
  "/faq",
  "/booking",
  "/cart",
  "/account"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteMetadata.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
