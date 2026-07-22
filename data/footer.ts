import type { NavItem } from "./navigation";

export type FooterLinkGroup = {
  title: string;
  links: NavItem[];
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Gift ideas", href: "/shop" }
    ]
  },
  {
    title: "Experiences",
    links: [
      { label: "Workshops", href: "/workshops" },
      { label: "Perfume Bar", href: "/perfume-bar" },
      { label: "Private events", href: "/private-events" }
    ]
  },
  {
    title: "Customer care",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & returns", href: "/faq" }
    ]
  },
  {
    title: "Legal",
    links: [
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
