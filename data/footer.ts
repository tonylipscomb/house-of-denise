import type { NavItem } from "./navigation";

export type FooterLinkGroup = {
  title: string;
  links: NavItem[];
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Candles", href: "/shop" },
      { label: "Fragrance", href: "/shop" },
      { label: "Gift Sets", href: "/shop" }
    ]
  },
  {
    title: "Experiences",
    links: [
      { label: "Mobile Fragrance Bar", href: "/perfume-bar" },
      { label: "Workshops", href: "/workshops" },
      { label: "Private Events", href: "/private-events" },
      { label: "Gift Experiences", href: "/shop" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "Our Story", href: "/our-story" },
      { label: "Testimonials", href: "/#testimonials" },
      { label: "FAQs", href: "/faq" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & Returns", href: "/faq" },
      { label: "Care Instructions", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  }
];

// TODO: Awaiting Tasheika questionnaire — add verified social URLs when available
export const socialLinks = {
  instagram: null as string | null,
  facebook: null as string | null,
  pinterest: null as string | null
};
