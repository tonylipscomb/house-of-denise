import type { LucideIcon } from "lucide-react";
import { Gift, HandHeart, Mail, PackageCheck, ScrollText, Sparkles, Truck } from "lucide-react";

export type ShopCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type ShopInfoItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  icon: LucideIcon;
};

export type ShopFaq = {
  id: string;
  question: string;
  answer: string;
};

export const shopHero = {
  eyebrow: "THE HOUSE OF DENISE COLLECTION",
  title: "Fragrance and self-care, prepared with intention.",
  description:
    "The House Of Denise product collection is being prepared for a thoughtful online launch. Expect fragrance, self-care, gifts, and keepsakes designed with the same warmth as every House experience.",
  primaryCta: { label: "Join the List", href: "#shop-newsletter" },
  secondaryCta: { label: "Explore Experiences", href: "/experiences" }
} as const;

export const shopCategories: ShopCategory[] = [
  {
    id: "fragrance",
    title: "Fragrance",
    description: "Scent-led products and keepsakes inspired by the House Of Denise fragrance experience.",
    icon: Sparkles
  },
  {
    id: "self-care",
    title: "Self-Care",
    description: "Ritual-focused goods for quiet care, gifting, and everyday restoration.",
    icon: HandHeart
  },
  {
    id: "gifts",
    title: "Gifts",
    description: "Giftable pieces and curated moments for meaningful celebrations.",
    icon: Gift
  },
  {
    id: "events",
    title: "Event Favorites",
    description: "Package-dependent keepsakes and product ideas for private experiences and gatherings.",
    icon: PackageCheck
  }
];

export const shopInfoItems: ShopInfoItem[] = [
  {
    id: "availability",
    title: "Availability",
    description: "Online product purchasing is not live yet. Product details, pricing, and checkout will be added only after they are confirmed.",
    icon: PackageCheck
  },
  {
    id: "shipping",
    title: "Shipping and pickup",
    description: "Shipping, local pickup, processing time, and fulfillment details are still being finalized before checkout launches.",
    icon: Truck,
    href: "/faq",
    linkLabel: "Read FAQ"
  },
  {
    id: "policies",
    title: "Policies",
    description: "Privacy and terms pages are available now. Product-specific return and care policies will be published with confirmed products.",
    icon: ScrollText,
    href: "/terms",
    linkLabel: "View Terms"
  }
];

export const shopFaqs: ShopFaq[] = [
  {
    id: "live",
    question: "Can I buy products online right now?",
    answer:
      "Not yet. The online shop is being prepared, and checkout will launch only after product details, pricing, and policies are confirmed."
  },
  {
    id: "products",
    question: "What products will be available?",
    answer:
      "House Of Denise may offer fragrance products, self-care goods, giftable items, event-related keepsakes, and curated luxury products."
  },
  {
    id: "shipping",
    question: "Where do you ship?",
    answer:
      "Shipping areas and fulfillment details have not been finalized. Confirmed shipping information will be published before checkout goes live."
  },
  {
    id: "pickup",
    question: "Is local pickup available?",
    answer:
      "Local pickup details are not confirmed yet. Pickup and delivery options will be shared when the product collection launches."
  },
  {
    id: "handmade",
    question: "Are products handmade?",
    answer:
      "House Of Denise is rooted in handmade goods and intentional self-care. Final product descriptions will identify confirmed materials, usage notes, and care details."
  },
  {
    id: "events",
    question: "Can products be purchased for events?",
    answer:
      "Event-related keepsakes or gifts may be discussed through the booking inquiry process, depending on the experience, package, and availability."
  }
];

export const shopFinalCta = {
  eyebrow: "COLLECTION LAUNCH",
  title: "Be First to Experience the Collection",
  description:
    "Join the House list for collection updates, event experiences, and thoughtful product launch notes.",
  primaryCta: { label: "Join the List", href: "#shop-newsletter" },
  secondaryCta: { label: "Contact House Of Denise", href: "/contact" },
  icon: Mail
} as const;
