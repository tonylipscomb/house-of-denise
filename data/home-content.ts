import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CalendarHeart,
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
  bookingHref?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: string;
  icon: LucideIcon;
};

export type TrustHighlight = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type ProcessStep = {
  id: string;
  title: string;
  description: string;
};

export type SignatureFeature = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type HomeTestimonial = {
  id: string;
  quote: string;
  name: string;
  eventType: string;
};

/* Image map for the homepage redesign.
 * Hero: /images/house-of-denise/hero-editorial.jpg (from mobilefragrancebar.png)
 * Featured cards use dedicated service images.
 * Signature: /images/house-of-denise/signature-experience.jpg (from gifts.png)
 * CTA: /images/house-of-denise/cta-editorial.jpg (from privateevents.png)
 * Replace hero-editorial later with a dedicated wide lifestyle shoot if available.
 */

export const heroContent = {
  eyebrow: "LUXURY FRAGRANCE EXPERIENCES",
  headingLines: ["Scents that celebrate.", "Experiences that connect."],
  body: "House of Denise creates elevated fragrance experiences, from luxury workshops and private events to mobile fragrance bars—designed for connection, self-care, and unforgettable celebrations.",
  primaryCta: { label: "Explore Experiences", href: "/experiences" },
  secondaryCta: { label: "Book Private Event", href: "/private-events" },
  trustHighlights: [
    { id: "bespoke", label: "Bespoke & Luxurious", icon: Sparkles },
    { id: "intentional", label: "Intentional & Memorable", icon: HeartHandshake },
    { id: "crafted", label: "Crafted With Care", icon: HandHeart }
  ] as TrustHighlight[],
  image: {
    src: "/images/house-of-denise/hero-editorial.jpg",
    alt: "House of Denise mobile fragrance bar with perfume bottles, florals, and candlelight",
    position: "center 45%"
  }
} as const;

export const trustSignals = [
  { id: "mobile", label: "Luxury Mobile Fragrance Experiences", icon: Sparkles },
  { id: "private", label: "Private Events", icon: CalendarHeart },
  { id: "corporate", label: "Corporate Experiences", icon: Users },
  { id: "workshops", label: "Custom Workshops", icon: Palette },
  { id: "owned", label: "Women-Owned Business", icon: HeartHandshake }
] as const;

export const featuredExperiencesHeading = {
  eyebrow: "FEATURED EXPERIENCES",
  title: "Curated for every kind of celebration.",
  description:
    "Choose a refined fragrance experience for private events, workshops, gifting, or guest-centered celebrations."
} as const;

export const homePillars: HomePillar[] = [
  {
    id: "fragrance-bar",
    title: "Mobile Fragrance Bar",
    description:
      "We bring the fragrance experience to you—perfect for celebrations, markets, brand activations, pop-ups, and more.",
    href: "/perfume-bar",
    linkLabel: "Learn More",
    imageSrc: "/images/house-of-denise/mobile-fragrance-bar.jpg",
    imageAlt: "Mobile fragrance bar with perfume bottles, florals, and scent testing strips",
    imagePosition: "center",
    icon: FlaskConical
  },
  {
    id: "workshops",
    title: "Luxury Workshops",
    description:
      "Guided fragrance-blending workshops designed to inspire creativity, connection, and self-care.",
    href: "/workshops",
    linkLabel: "Learn More",
    imageSrc: "/images/house-of-denise/luxury-workshops.jpg",
    imageAlt: "Workshop setup with amber dropper bottles, candle, and scent strips",
    imagePosition: "center",
    icon: Palette
  },
  {
    id: "private-events",
    title: "Private Events",
    description:
      "Intimate, elevated experiences curated for birthdays, bridal showers, celebrations, and special occasions.",
    href: "/private-events",
    linkLabel: "Learn More",
    imageSrc: "/images/house-of-denise/private-events.jpg",
    imageAlt: "Private events table setting with House of Denise branding and candlelight",
    imagePosition: "center",
    icon: CalendarHeart
  },
  {
    id: "gift-experiences",
    title: "Gift Experiences",
    description:
      "Beautifully packaged fragrance and self-care experiences for gifting, client appreciation, and meaningful occasions.",
    href: "/shop",
    linkLabel: "Learn More",
    imageSrc: "/images/house-of-denise/gift-experiences.jpg",
    imageAlt: "House of Denise gift boxes with gold ribbon and perfume bottle",
    imagePosition: "center",
    icon: Gift
  }
];

export const signatureExperience = {
  eyebrow: "OUR SIGNATURE",
  heading: "The House of Denise Experience",
  body: "We believe fragrance is more than a scent—it is a feeling, a memory, and a moment of connection. Our experiences blend luxury, creativity, and intention to help guests slow down, celebrate, and create something uniquely their own.",
  imageSrc: "/images/house-of-denise/signature-experience.jpg",
  imageAlt: "House of Denise gift packaging with perfume bottle, ribbon, and dried florals",
  features: [
    { id: "materials", label: "Premium Materials", icon: Sparkles },
    { id: "guidance", label: "Thoughtful Guidance", icon: ShieldCheck },
    { id: "connection", label: "Meaningful Connection", icon: Users },
    { id: "moments", label: "Unforgettable Moments", icon: Star }
  ] as SignatureFeature[],
  cta: { label: "Explore Our Story", href: "/our-story" }
};

export const processHeading = {
  eyebrow: "A CONSIDERED PATH FROM INQUIRY TO EXPERIENCE",
  title: "How it works"
} as const;

export const bookingProcessSteps: ProcessStep[] = [
  {
    id: "inquiry",
    title: "Submit Inquiry",
    description: "Tell us about your event, goals, preferred date, and vision."
  },
  {
    id: "consultation",
    title: "Consultation",
    description: "We connect to discuss your ideas, preferences, and experience details."
  },
  {
    id: "proposal",
    title: "Proposal & Plan",
    description: "You receive a thoughtful proposal and curated experience plan."
  },
  {
    id: "experience",
    title: "Experience Day",
    description: "House of Denise brings the experience to life with polished execution."
  },
  {
    id: "impact",
    title: "Lasting Impact",
    description: "Guests leave with meaningful memories and a scent experience that lasts."
  }
];

export const homeTestimonial: HomeTestimonial = {
  id: "featured",
  quote:
    "House of Denise made our celebration feel intimate and unforgettable. Every guest left talking about the fragrance experience.",
  name: "Amanda R.",
  eventType: "Bridal Shower"
};

export const bookingCta = {
  eyebrow: "READY TO CREATE SOMETHING BEAUTIFUL?",
  title: "Let's bring your vision to life.",
  description:
    "Start planning a custom fragrance experience created around your celebration, guests, and vision.",
  cta: { label: "Book Your Experience", href: "/booking" },
  imageSrc: "/images/house-of-denise/cta-editorial.jpg",
  imageAlt: "Elegant private events styling with House of Denise branding and candlelight"
} as const;

/* Kept for other pages / residual imports */
export const aboutTeaser = {
  eyebrow: "MEET DENISE",
  title: "A house built on care, craft and beautiful memory.",
  description:
    "Founded by Tasheika Meadows, House Of Denise brings luxury fragrance, self-care and meaningful experiences together with thoughtful hospitality, feminine ease and a warm sense of community.",
  cta: { label: "Meet Tasheika", href: "/our-story" }
} as const;

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

export const experienceToneItems = [
  { id: "luxury", label: "Luxury fragrance", icon: Sparkles },
  { id: "self-care", label: "Self-care rituals", icon: HandHeart },
  { id: "hospitality", label: "Thoughtful hospitality", icon: Gift },
  { id: "community", label: "Community connection", icon: HeartHandshake }
] as const;

export type InstagramImage = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: string;
  size: "wide" | "tall" | "standard";
};

export const instagramGallery: InstagramImage[] = [
  {
    id: "gallery-fragrance",
    imageSrc: "/images/house-of-denise/mobile-fragrance-bar.jpg",
    imageAlt: "Fragrance bottles arranged for a House Of Denise experience",
    imagePosition: "center",
    size: "tall"
  },
  {
    id: "gallery-shop",
    imageSrc: "/images/house-of-denise/gift-experiences.jpg",
    imageAlt: "House Of Denise handcrafted gift packaging",
    imagePosition: "center",
    size: "standard"
  },
  {
    id: "gallery-workshop",
    imageSrc: "/images/house-of-denise/luxury-workshops.jpg",
    imageAlt: "Creative workshop setup with materials",
    imagePosition: "center",
    size: "wide"
  },
  {
    id: "gallery-events",
    imageSrc: "/images/house-of-denise/private-events.jpg",
    imageAlt: "Private event setting styled for celebration",
    imagePosition: "center",
    size: "standard"
  },
  {
    id: "gallery-hero",
    imageSrc: "/images/house-of-denise/hero-editorial.jpg",
    imageAlt: "House Of Denise lifestyle fragrance scene",
    imagePosition: "center",
    size: "wide"
  }
];
