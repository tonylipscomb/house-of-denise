import type { LucideIcon } from "lucide-react";
import { HeartHandshake, Palette, Sparkles, Users } from "lucide-react";

export type WorkshopOffering = {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  details: string[];
};

export type WorkshopHighlight = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const workshopsPage = {
  eyebrow: "Learn & Create",
  title: "Luxury fragrance workshops",
  description:
    "Hands-on sessions designed for creativity, connection, and the joy of crafting a scent that feels uniquely yours.",
  stayTuned: {
    eyebrow: "Stay Tuned",
    title: "Public dates coming soon",
    body: "Our studio calendar is being refined. Private group workshops are available to book anytime."
  }
} as const;

export const workshopOfferings: WorkshopOffering[] = [
  {
    id: "signature-workshop",
    title: "Signature Fragrance Workshop",
    description:
      "An intimate, guided blending experience where guests explore notes, create a personal scent, and leave with a keepsake bottle.",
    href: "/booking",
    ctaLabel: "Book a Workshop",
    imageSrc: "/images/house-of-denise/luxury-workshops.jpg",
    imageAlt: "Workshop setup with amber dropper bottles, candlelight, and scent strips",
    details: ["Guided scent education", "Personal blend to take home", "Ideal for 10–20 guests"]
  },
  {
    id: "perfume-bar-workshop",
    title: "Perfume Bar Experience",
    description:
      "A refined perfume-bar style session for celebrations and gatherings—interactive, elegant, and unforgettable.",
    href: "/perfume-bar",
    ctaLabel: "Explore Perfume Bar",
    imageSrc: "/images/house-of-denise/shop-perfume-bar.jpg",
    imageAlt: "Perfume bottles arranged on a styled fragrance bar",
    details: ["Interactive blending station", "Beautiful presentation", "Perfect for celebrations"]
  }
];

export const workshopHighlights: WorkshopHighlight[] = [
  {
    id: "guided",
    title: "Expertly guided",
    description: "Thoughtful instruction that makes fragrance blending feel approachable and inspiring.",
    icon: Sparkles
  },
  {
    id: "creative",
    title: "Creatively immersive",
    description: "A sensory experience designed to slow down, explore, and create together.",
    icon: Palette
  },
  {
    id: "connection",
    title: "Made for connection",
    description: "Ideal for friends, teams, bridal parties, and meaningful group moments.",
    icon: Users
  },
  {
    id: "keepsake",
    title: "A lasting keepsake",
    description: "Guests leave with a scent memory—and often a bottle to take home.",
    icon: HeartHandshake
  }
];

export const workshopSteps = [
  {
    id: "choose",
    title: "Choose your workshop",
    description: "Select a signature session or perfume-bar style experience for your group."
  },
  {
    id: "plan",
    title: "Share your vision",
    description: "Tell us about your occasion, guest count, and preferred timing."
  },
  {
    id: "create",
    title: "Create together",
    description: "We host a polished, hands-on experience filled with fragrance and connection."
  }
] as const;
