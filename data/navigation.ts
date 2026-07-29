export type NavItem = {
  label: string;
  href: string;
};

export type BookingNavItem = {
  label: string;
  href: string;
  description: string;
};

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Experiences", href: "/experiences" },
  { label: "Workshops", href: "/workshops" },
  { label: "Our Story", href: "/our-story" }
];

export const bookingNav: BookingNavItem[] = [
  {
    label: "Workshops",
    href: "/workshops",
    description: "Hands-on classes to learn, create, and connect."
  },
  {
    label: "Perfume Bar",
    href: "/perfume-bar",
    description: "Design a signature scent in a guided fragrance experience."
  },
  {
    label: "Private Events",
    href: "/private-events",
    description: "Celebrate milestones with a creative gathering."
  }
];

export const utilityNav: NavItem[] = [
  { label: "Cart", href: "/cart" },
  { label: "Account", href: "/account" }
];
