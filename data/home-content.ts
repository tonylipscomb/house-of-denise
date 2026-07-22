import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CalendarHeart,
  Building2,
  Flame,
  FlaskConical,
  Gift,
  HandHeart,
  HeartHandshake,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react";

export type HomePillar = {
  id: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  bookingHref: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: string;
  icon: LucideIcon;
};

export type SignatureExperience = {
  heading: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  perfectFor: string[];
  cta: { label: string; href: string };
};

export type InstagramImage = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: string;
  size: "wide" | "tall" | "standard";
};

export const heroContent = {
  eyebrow: "LUXURY FRAGRANCE EXPERIENCES",
  heading: "Luxury fragrance experiences, beautifully brought to you.",
  body: "House Of Denise creates elevated mobile fragrance bars, workshops and private-event experiences designed for connection, self-care and unforgettable celebration.",
  primaryCta: { label: "Book Your Experience", href: "/booking" },
  secondaryCta: { label: "Explore Services", href: "/experiences" },
  accent: "Fragrance - Self-Care - Experiences",
  image: {
    src: "/images/house-of-denise/hero-lifestyle.png",
    alt: "Warm lifestyle scene with House Of Denise fragrance and self-care styling"
  }
} as const;

export const trustSignals = [
  { id: "mobile", label: "Luxury Mobile Fragrance Experiences", icon: Sparkles },
  { id: "private", label: "Private Events", icon: CalendarHeart },
  { id: "corporate", label: "Corporate Experiences", icon: Building2 },
  { id: "workshops", label: "Custom Workshops", icon: Palette },
  { id: "owned", label: "Women-Owned Business", icon: HeartHandshake }
] as const;

export const homePillars: HomePillar[] = [
  {
    id: "fragrance-bar",
    title: "Mobile Fragrance Bar",
    description: "A polished scent-blending experience brought to weddings, birthdays, showers, corporate gatherings and intimate celebrations.",
    href: "/perfume-bar",
    linkLabel: "Learn More",
    bookingHref: "/booking",
    imageSrc: "/images/house-of-denise/pillar-perfume.jpg",
    imageAlt: "Fragrance bottles and oils arranged for a scent blending experience",
    imagePosition: "70% center",
    icon: FlaskConical
  },
  {
    id: "workshops",
    title: "Luxury Workshops",
    description: "Guided fragrance and self-care sessions that feel intimate, refined and memorable for groups of many sizes.",
    href: "/workshops",
    linkLabel: "Learn More",
    bookingHref: "/booking",
    imageSrc: "/images/house-of-denise/pillar-workshops.jpg",
    imageAlt: "Guests creating together during a workshop",
    imagePosition: "30% center",
    icon: Palette
  },
  {
    id: "private-events",
    title: "Private Events",
    description: "Thoughtful event activations with an elegant setup, guest-friendly flow and premium presentation from arrival to close.",
    href: "/private-events",
    linkLabel: "Learn More",
    bookingHref: "/booking",
    imageSrc: "/images/house-of-denise/pillar-events.jpg",
    imageAlt: "Styled private event table for a luxury creative gathering",
    imagePosition: "center 35%",
    icon: CalendarHeart
  },
  {
    id: "gift-experiences",
    title: "Gift Experiences",
    description: "Beautifully considered fragrance and self-care moments for gifting, celebrations, client appreciation and special occasions.",
    href: "/shop",
    linkLabel: "Learn More",
    bookingHref: "/booking",
    imageSrc: "/images/house-of-denise/pillar-shop.jpg",
    imageAlt: "Handcrafted self-care products styled on a warm surface",
    imagePosition: "center 45%",
    icon: Gift
  }
];

export const signatureExperience: SignatureExperience = {
  heading: "The Signature Fragrance Experience",
  body: "Our mobile fragrance bar transforms ordinary celebrations into unforgettable memories.",
  imageSrc: "/images/house-of-denise/pillar-perfume.jpg",
  imageAlt: "Luxury fragrance bar with bottles and blending materials",
  perfectFor: ["Birthdays", "Bridal Showers", "Corporate Events", "Private Parties", "Baby Showers", "Weddings"],
  cta: { label: "Reserve Your Experience", href: "/booking" }
};

export const aboutTeaser = {
  eyebrow: "MEET DENISE",
  title: "A house built on care, craft and beautiful memory.",
  description:
    "Founded by Tasheika Meadows, House Of Denise brings luxury fragrance, self-care and meaningful experiences together with thoughtful hospitality, feminine ease and a warm sense of community.",
  cta: { label: "Meet Tasheika", href: "/our-story" }
} as const;

export const instagramGallery: InstagramImage[] = [
  {
    id: "gallery-fragrance",
    imageSrc: "/images/house-of-denise/pillar-perfume.jpg",
    imageAlt: "Fragrance bottles arranged for a House Of Denise experience",
    imagePosition: "65% center",
    size: "tall"
  },
  {
    id: "gallery-shop",
    imageSrc: "/images/house-of-denise/pillar-shop.jpg",
    imageAlt: "House Of Denise handcrafted self-care products",
    imagePosition: "center 45%",
    size: "standard"
  },
  {
    id: "gallery-workshop",
    imageSrc: "/images/house-of-denise/pillar-workshops.jpg",
    imageAlt: "Creative workshop setup with materials",
    imagePosition: "30% center",
    size: "wide"
  },
  {
    id: "gallery-events",
    imageSrc: "/images/house-of-denise/pillar-events.jpg",
    imageAlt: "Private event setting styled for celebration",
    imagePosition: "center 35%",
    size: "standard"
  },
  {
    id: "gallery-hero",
    imageSrc: "/images/house-of-denise/hero-lifestyle.png",
    imageAlt: "House Of Denise lifestyle scene",
    imagePosition: "center 42%",
    size: "wide"
  }
];

export const experienceToneItems = [
  { id: "luxury", label: "Luxury fragrance", icon: Sparkles },
  { id: "self-care", label: "Self-care rituals", icon: HandHeart },
  { id: "hospitality", label: "Thoughtful hospitality", icon: Gift },
  { id: "community", label: "Community connection", icon: Flame }
] as const;

export const bookingProcessSteps = [
  {
    id: "inquiry",
    title: "Submit Inquiry",
    description: "Share your date, guest count, event type and fragrance-experience preferences."
  },
  {
    id: "consultation",
    title: "Consultation",
    description: "House Of Denise reviews your details and follows up to learn more about the celebration."
  },
  {
    id: "proposal",
    title: "Proposal Review",
    description: "You receive availability, experience recommendations and planning details for review."
  },
  {
    id: "deposit",
    title: "Square Deposit",
    description: "After review, deposit details are provided through the approved payment workflow."
  },
  {
    id: "experience",
    title: "Luxury Experience",
    description: "Your guests enjoy a polished fragrance moment designed with care from setup to close."
  }
] as const;

export const whyHouseItems = [
  {
    id: "personalized",
    title: "Personalized experiences",
    description: "Every inquiry is reviewed for the event type, audience and mood you want to create.",
    icon: Users
  },
  {
    id: "premium",
    title: "Premium fragrances",
    description: "Guests are guided through scent notes and fragrance choices with a calm, elevated approach.",
    icon: Sparkles
  },
  {
    id: "setup",
    title: "Professional setup",
    description: "The experience is designed to arrive beautifully, flow smoothly and photograph well.",
    icon: ShieldCheck
  },
  {
    id: "memorable",
    title: "Memorable events",
    description: "Fragrance gives guests a personal keepsake that carries the memory beyond the day.",
    icon: Star
  },
  {
    id: "presentation",
    title: "High-end presentation",
    description: "Soft luxury styling, clear guest guidance and thoughtful details shape the full impression.",
    icon: BadgeCheck
  }
] as const;

export const homepageFaqs = [
  {
    question: "What areas do you travel to?",
    answer:
      "House Of Denise reviews each inquiry based on event location, date and setup needs. Share your city and state through the booking inquiry form so travel details can be confirmed."
  },
  {
    question: "Is a deposit required?",
    answer:
      "Submitting an inquiry does not require a payment. Deposit details are shared only after availability and experience details have been reviewed."
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellation and rescheduling details are reviewed during the planning process so expectations are clear before a date is confirmed."
  },
  {
    question: "How many guests can participate?",
    answer:
      "Guest count depends on the experience format, event schedule and setup needs. Include your estimated guest count in the inquiry so the right format can be recommended."
  },
  {
    question: "Do you offer corporate events?",
    answer:
      "Yes. House Of Denise can support corporate celebrations, team experiences, client appreciation moments and branded fragrance activations."
  },
  {
    question: "Can the experience be customized?",
    answer:
      "Yes. Customization can include event styling, fragrance direction, guest flow and special touches after the inquiry is reviewed."
  }
] as const;

export const finalCta = {
  eyebrow: "START WITH AN INQUIRY",
  title: "Let's Create Something Beautiful",
  description:
    "Tell House Of Denise about your celebration, and the team will follow up with availability, planning details and next steps.",
  cta: { label: "Book Your Experience", href: "/booking" }
} as const;
