import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarHeart,
  ClipboardList,
  Droplets,
  Gem,
  Gift,
  HandHeart,
  Heart,
  Palette,
  Sparkles,
  Tag,
  TentTree,
  Users
} from "lucide-react";

type Cta = {
  label: string;
  href: string;
};

export type FragranceHero = {
  eyebrow: string;
  heading: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  supportLine: string;
  image: {
    src: string;
    alt: string;
    position: string;
  };
};

export type FragrancePoint = {
  id: string;
  text: string;
  icon: LucideIcon;
};

export type FragranceStep = {
  id: string;
  title: string;
  description: string;
};

export type FragranceBenefit = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FragranceEventType = {
  id: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  image: {
    src: string;
    alt: string;
    position: string;
  };
};

export type FragranceFormat = {
  id: string;
  title: string;
  suitedFor: string;
  planningNote: string;
  cta: Cta;
  icon: LucideIcon;
};

export type FragranceGalleryItem = {
  id: string;
  src: string;
  alt: string;
  position: string;
  size: "standard" | "wide" | "tall";
};

export type FragranceValue = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FragranceFaq = {
  id: string;
  question: string;
  answer: string;
};

export type FragranceCustomization = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const fragranceHero: FragranceHero = {
  eyebrow: "SIGNATURE EXPERIENCE",
  heading: "A mobile fragrance bar for unforgettable events.",
  body: "House Of Denise brings an elevated fragrance experience to your venue, guiding guests through scent discovery, personalization, and a beautiful keepsake moment.",
  primaryCta: { label: "Request Your Experience", href: "/booking" },
  secondaryCta: { label: "See How It Works", href: "#fragrance-how-it-works" },
  supportLine: "Mobile setup - personalized fragrance blending - private and corporate events - custom guest experience",
  image: {
    src: "/images/house-of-denise/hero-lifestyle.png",
    alt: "House Of Denise candle and self-care details styled in warm light",
    position: "center 44%"
  }
};

export const introPoints: FragrancePoint[] = [
  { id: "discovery", text: "Guided scent discovery", icon: Sparkles },
  { id: "creation", text: "Personalized fragrance creation", icon: HandHeart },
  { id: "keepsake", text: "A meaningful keepsake to take home", icon: Gift }
];

export const fragranceSteps: FragranceStep[] = [
  {
    id: "arrival",
    title: "Arrive beautifully",
    description: "House Of Denise brings a styled fragrance bar to your venue and sets the tone for guest participation."
  },
  {
    id: "notes",
    title: "Explore notes",
    description: "Guests are guided through curated fragrance notes and approachable scent discovery."
  },
  {
    id: "create",
    title: "Personalize scent",
    description: "Each guest creates or personalizes a fragrance with support from the experience host."
  },
  {
    id: "style",
    title: "Match the event",
    description: "The setup can be styled around the event direction, package details, and available customization options."
  },
  {
    id: "review",
    title: "Reviewed before approval",
    description: "Every inquiry is reviewed for date, guest count, venue needs, and fit before confirmation."
  }
];

export const fragranceBenefits: FragranceBenefit[] = [
  {
    id: "consultation",
    title: "Pre-event consultation",
    description: "Planning details are reviewed before approval so the experience fits the event setting.",
    icon: ClipboardList
  },
  {
    id: "selection",
    title: "Curated fragrance selection",
    description: "Guests explore a focused selection of fragrance notes chosen for an approachable, elevated experience.",
    icon: Sparkles
  },
  {
    id: "discovery",
    title: "Guided scent discovery",
    description: "A House Of Denise host helps guests understand notes, preferences, and blend direction.",
    icon: Droplets
  },
  {
    id: "setup",
    title: "Luxury display setup",
    description: "Presentation, setup, and breakdown are handled with a polished guest-facing experience in mind.",
    icon: BadgeCheck
  },
  {
    id: "materials",
    title: "Blending materials",
    description: "Core fragrance-making materials are included based on the selected package and guest count.",
    icon: Gem
  },
  {
    id: "keepsake",
    title: "Personal keepsakes",
    description: "Labels, keepsakes, and finishing details may be customized depending on the package.",
    icon: Gift
  },
  {
    id: "hospitality",
    title: "Hosted guest experience",
    description: "Warm facilitation keeps the flow comfortable, clear, and memorable for guests.",
    icon: Heart
  }
];

export const eventTypes: FragranceEventType[] = [
  {
    id: "birthdays",
    title: "Birthdays",
    description: "A personal, hands-on activity that gives guests a beautiful keepsake from the celebration.",
    href: "/booking",
    linkLabel: "Start planning",
    image: {
      src: "/images/house-of-denise/pillar-events.jpg",
      alt: "Styled table for a private House Of Denise celebration",
      position: "center 35%"
    }
  },
  {
    id: "bridal-showers",
    title: "Bridal Showers",
    description: "An intimate fragrance moment for friends and family to enjoy together before the wedding day.",
    href: "/booking",
    linkLabel: "Start planning",
    image: {
      src: "/images/house-of-denise/pillar-workshops.jpg",
      alt: "Hands-on creative workshop setup for guests",
      position: "30% center"
    }
  },
  {
    id: "weddings",
    title: "Weddings",
    description: "A refined guest activation that adds a sensory keepsake to showers, welcome events, or receptions.",
    href: "/private-events",
    linkLabel: "Explore this experience",
    image: {
      src: "/images/house-of-denise/pillar-events.jpg",
      alt: "Styled private event table for a House Of Denise wedding fragrance experience",
      position: "center 35%"
    }
  },
  {
    id: "corporate-events",
    title: "Corporate Events",
    description: "A polished, memorable option for team-building, client appreciation, employee events, and retreats.",
    href: "/private-events",
    linkLabel: "Explore this experience",
    image: {
      src: "/images/house-of-denise/pillar-perfume.jpg",
      alt: "Fragrance bottles arranged for scent blending",
      position: "68% center"
    }
  },
  {
    id: "private-parties",
    title: "Private Celebrations",
    description: "A boutique experience for dinner parties, milestones, family gatherings, and hosted moments.",
    href: "/private-events",
    linkLabel: "Start planning",
    image: {
      src: "/images/house-of-denise/hero-lifestyle.png",
      alt: "House Of Denise lifestyle scene with fragrance and self-care details",
      position: "center 44%"
    }
  },
  {
    id: "milestones",
    title: "Brand Activations & Pop-ups",
    description: "A fragrance-centered experience that can support brand moments, retail events, and community pop-ups.",
    href: "/booking",
    linkLabel: "Start planning",
    image: {
      src: "/images/house-of-denise/pillar-shop.jpg",
      alt: "House Of Denise self-care and gift styling for a branded fragrance experience",
      position: "center 45%"
    }
  }
];

export const experienceFormats: FragranceFormat[] = [
  {
    id: "private",
    title: "Private Fragrance Experience",
    suitedFor: "A personalized fragrance experience for intimate gatherings, birthdays, showers, and private celebrations.",
    planningNote: "Planning is shaped around your occasion, guest count, and vision.",
    cta: { label: "Start Planning", href: "/booking" },
    icon: Users
  },
  {
    id: "wedding-large",
    title: "Wedding & Large Event Experience",
    suitedFor: "A guided fragrance experience designed for weddings and larger celebrations that require additional planning and coordination.",
    planningNote: "Details are reviewed carefully so the experience feels polished for the event setting.",
    cta: { label: "Inquire About Your Event", href: "/private-events" },
    icon: CalendarHeart
  },
  {
    id: "corporate",
    title: "Corporate Fragrance Experience",
    suitedFor: "An elevated hands-on experience for team gatherings, client appreciation, employee events, and organizational celebrations.",
    planningNote: "House Of Denise will review the event goals and planning needs during consultation.",
    cta: { label: "Plan a Corporate Experience", href: "/private-events" },
    icon: BriefcaseBusiness
  }
];

export const galleryItems: FragranceGalleryItem[] = [
  {
    id: "bottles",
    src: "/images/house-of-denise/pillar-perfume.jpg",
    alt: "Fragrance bottles and blending materials",
    position: "68% center",
    size: "tall"
  },
  {
    id: "hands",
    src: "/images/house-of-denise/pillar-workshops.jpg",
    alt: "Hands working with creative materials during a guided experience",
    position: "30% center",
    size: "standard"
  },
  {
    id: "tables",
    src: "/images/house-of-denise/pillar-events.jpg",
    alt: "Styled event table for a private celebration",
    position: "center 35%",
    size: "wide"
  },
  {
    id: "self-care",
    src: "/images/house-of-denise/pillar-shop.jpg",
    alt: "Handcrafted self-care products styled warmly",
    position: "center 45%",
    size: "standard"
  },
  {
    id: "celebration",
    src: "/images/house-of-denise/pillar-events.jpg",
    alt: "Warm private event setting styled for a fragrance experience",
    position: "center 35%",
    size: "standard"
  },
  {
    id: "keepsake",
    src: "/images/house-of-denise/hero-lifestyle.png",
    alt: "House Of Denise fragrance and self-care keepsake styling",
    position: "center 44%",
    size: "wide"
  }
];

export const fragranceValues: FragranceValue[] = [
  {
    id: "hospitality",
    title: "Intentional Hospitality",
    description: "Every detail is designed to help guests feel welcomed, comfortable, and cared for.",
    icon: HandHeart
  },
  {
    id: "connection",
    title: "Personal Connection",
    description: "The experience encourages creativity, conversation, and connection.",
    icon: Users
  },
  {
    id: "keepsakes",
    title: "Meaningful Keepsakes",
    description: "Guests leave with something personal that extends the memory beyond the event.",
    icon: Gift
  }
];

export const bookingSteps: FragranceStep[] = [
  { id: "submit", title: "Submit Inquiry", description: "Share your occasion, guest count, event date, venue, and fragrance vision." },
  { id: "consultation", title: "Consultation", description: "House Of Denise reviews your details and follows up to discuss fit, flow, and availability." },
  { id: "proposal", title: "Proposal Review", description: "You receive planning details and package-dependent recommendations before approval." },
  { id: "deposit", title: "Square Deposit", description: "If approved, required Square deposit details are provided through the planning process." },
  { id: "experience", title: "Luxury Experience", description: "The experience moves forward only after review, approval, and required deposit completion." }
];

export const fragranceFaqs: FragranceFaq[] = [
  {
    id: "guest-count",
    question: "How many guests can participate?",
    answer: "Guest count depends on the event format, package, timing, and venue setup. Include your estimated guest count in the inquiry so House Of Denise can recommend the right experience flow."
  },
  {
    id: "space",
    question: "How much space is needed?",
    answer: "Space needs depend on the display setup, guest flow, and selected package. Venue details are reviewed during consultation before the experience is approved."
  },
  {
    id: "travel",
    question: "Do you travel?",
    answer: "Yes, the mobile fragrance bar is designed to come to the event location. Travel details are reviewed based on city, state, date, and setup needs."
  },
  {
    id: "duration",
    question: "How long does the experience last?",
    answer: "Timing depends on the guest count, format, and event schedule. House Of Denise reviews the timeline during consultation so the experience can flow comfortably."
  },
  {
    id: "colors",
    question: "Can the setup match the event colors?",
    answer: "Styling, color direction, labels, and display details may be customized depending on the package and available materials."
  },
  {
    id: "created",
    question: "Are fragrances premade or created during the event?",
    answer: "The experience is designed around guided scent discovery and personalization. Exact fragrance format and keepsake details are confirmed during planning."
  },
  {
    id: "deposit",
    question: "Is a deposit required?",
    answer: "A deposit may be required after the inquiry is reviewed and approved. Submitting an inquiry does not reserve a date or confirm availability."
  },
  {
    id: "reserved",
    question: "When is the date officially reserved?",
    answer: "A date is not officially reserved until the inquiry is reviewed, the experience is approved, and any required Square deposit is completed."
  },
  {
    id: "corporate",
    question: "Can this be used for corporate events?",
    answer: "Yes. Corporate fragrance experiences can support team-building, client appreciation, employee celebrations, and brand activations."
  },
  {
    id: "outdoor",
    question: "Are outdoor events accepted?",
    answer: "Outdoor events may be considered based on venue conditions, weather plan, setup needs, and guest flow. These details are reviewed during consultation."
  }
];

export const bookingPathway = {
  heading: "Inquiry, review, approval, Square deposit, confirmation.",
  body: "Tell us about your event, guest count, timing, and vision. House Of Denise reviews each inquiry before approval, deposit details, and final confirmation.",
  primaryCta: { label: "Submit an Inquiry", href: "/booking" },
  secondaryCta: { label: "Ask a Question", href: "/contact" }
} as const;

export const finalFragranceCta = {
  heading: "Bring a Signature Fragrance Experience to Your Event",
  body: "Share your event details and House Of Denise will review your inquiry, customize the experience direction, and guide next steps.",
  primaryCta: { label: "Request Your Experience", href: "/booking" },
  secondaryCta: { label: "Explore All Experiences", href: "/experiences" }
} as const;

export const customizationOptions: FragranceCustomization[] = [
  {
    id: "profile",
    title: "Fragrance profile",
    description: "Scent direction can be shaped around the mood of the event and guest experience.",
    icon: Droplets
  },
  {
    id: "styling",
    title: "Event styling",
    description: "Display details and color direction may be aligned with the celebration when available.",
    icon: Palette
  },
  {
    id: "labels",
    title: "Labels and keepsakes",
    description: "Personalized labels or keepsake details can be discussed during proposal review.",
    icon: Tag
  },
  {
    id: "guest-count",
    title: "Guest count and flow",
    description: "The experience can be planned around group size, timing, and how guests will move through the bar.",
    icon: Users
  },
  {
    id: "corporate",
    title: "Corporate details",
    description: "Brand colors, client appreciation moments, and team-event touches may be available by package.",
    icon: BriefcaseBusiness
  },
  {
    id: "addons",
    title: "Package-dependent add-ons",
    description: "Additional keepsakes, styling, and setup details are reviewed based on event goals and availability.",
    icon: TentTree
  }
];
