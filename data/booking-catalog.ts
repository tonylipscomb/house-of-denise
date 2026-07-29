/**
 * Trusted booking catalog configuration.
 * Server pricing recalculates from these values — never trust browser totals.
 * Later: sync/replace with Supabase services + service_variants.
 */

export type BookingExperienceId =
  | "mobile-fragrance-bar"
  | "private-events"
  | "luxury-workshops"
  | "perfume-bar-experience";

export type BookingPackageId = "essential" | "signature" | "luxury" | "custom";

export type BookingUpgradeId =
  | "additional-guests"
  | "custom-labels"
  | "gift-packaging"
  | "travel-outside-area"
  | "extra-fragrance-station"
  | "extended-event-time"
  | "decor-upgrade"
  | "luxury-takeaway-favors"
  | "custom-signage";

export type BookingExperience = {
  id: BookingExperienceId;
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  startingPriceCents: number;
  durationLabel: string;
  guestRangeLabel: string;
  minGuests: number;
  maxGuests: number;
  durationMinutes: number;
  mostPopular?: boolean;
  packageIds: BookingPackageId[];
  upgradeIds: BookingUpgradeId[];
  depositPercent: number;
  serviceFeeCents: number;
};

export type BookingPackage = {
  id: BookingPackageId;
  name: string;
  description: string;
  priceCents: number | null; // null = custom / quoted
  mostPopular?: boolean;
  features: string[];
  requiresManualApproval?: boolean;
  guestAllowance: number;
  fragranceOptions: number;
};

export type BookingUpgrade = {
  id: BookingUpgradeId;
  name: string;
  description: string;
  priceCents: number | null; // null = quoted separately
  allowQuantity: boolean;
  maxQuantity: number;
};

export const BOOKING_TIMEZONE = "America/New_York";
export const BOOKING_CURRENCY = "USD";
export const REMAINING_BALANCE_DAYS_BEFORE_EVENT = 7;
export const SERVICE_FEE_DEFAULT_CENTS = 12500;

export const occasionOptions = [
  "Birthday",
  "Bridal shower",
  "Baby shower",
  "Wedding",
  "Corporate event",
  "Team-building event",
  "Girls’ night",
  "Community event",
  "Holiday event",
  "Other"
] as const;

export const eventTypeOptionsWizard = [
  "Social Event",
  "Corporate Event",
  "Private Celebration",
  "Brand Activation",
  "Other"
] as const;

export const indoorOutdoorOptions = ["Indoor", "Outdoor", "Both / Mixed"] as const;

export const preferredContactOptions = ["Email", "Phone", "Text", "No Preference"] as const;

export const bookingPackages: Record<BookingPackageId, BookingPackage> = {
  essential: {
    id: "essential",
    name: "Essential",
    description: "An elegant entry-level experience with curated fragrance options.",
    priceCents: 85000,
    features: ["2 Fragrance Options", "Base Guest Allowance", "Guided Scent Experience"],
    guestAllowance: 25,
    fragranceOptions: 2
  },
  signature: {
    id: "signature",
    name: "Signature",
    description: "Our most-loved package with premium presentation and broader selection.",
    priceCents: 125000,
    mostPopular: true,
    features: ["3 Fragrance Options", "Up to 50 Guests", "Premium Presentation"],
    guestAllowance: 50,
    fragranceOptions: 3
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    description: "An elevated experience with expanded fragrance selection and styling.",
    priceCents: 175000,
    features: ["5 Fragrance Options", "Up to 75 Guests", "Elevated Decor"],
    guestAllowance: 75,
    fragranceOptions: 5
  },
  custom: {
    id: "custom",
    name: "Custom",
    description: "A fully tailored experience for larger or highly personalized events.",
    priceCents: null,
    features: ["Custom Fragrance Direction", "Flexible Guest Count", "Manual Approval Required"],
    requiresManualApproval: true,
    guestAllowance: 100,
    fragranceOptions: 6
  }
};

export const bookingUpgrades: Record<BookingUpgradeId, BookingUpgrade> = {
  "additional-guests": {
    id: "additional-guests",
    name: "Additional Guests",
    description: "Add guest capacity beyond the selected package allowance.",
    priceCents: 1500,
    allowQuantity: true,
    maxQuantity: 50
  },
  "custom-labels": {
    id: "custom-labels",
    name: "Custom Labels",
    description: "Personalized fragrance labels for your celebration.",
    priceCents: 7500,
    allowQuantity: false,
    maxQuantity: 1
  },
  "gift-packaging": {
    id: "gift-packaging",
    name: "Gift Packaging",
    description: "Elevated packaging for take-home fragrance keepsakes.",
    priceCents: 9500,
    allowQuantity: false,
    maxQuantity: 1
  },
  "travel-outside-area": {
    id: "travel-outside-area",
    name: "Travel Outside Service Area",
    description: "Travel fee for venues outside the standard service radius.",
    priceCents: null,
    allowQuantity: false,
    maxQuantity: 1
  },
  "extra-fragrance-station": {
    id: "extra-fragrance-station",
    name: "Extra Fragrance Station",
    description: "An additional blending station for larger guest flow.",
    priceCents: 25000,
    allowQuantity: false,
    maxQuantity: 1
  },
  "extended-event-time": {
    id: "extended-event-time",
    name: "Extended Event Time",
    description: "Add one extra hour to the experience window.",
    priceCents: 20000,
    allowQuantity: true,
    maxQuantity: 3
  },
  "decor-upgrade": {
    id: "decor-upgrade",
    name: "Decor Upgrade",
    description: "Enhanced tablescape and fragrance bar styling.",
    priceCents: 17500,
    allowQuantity: false,
    maxQuantity: 1
  },
  "luxury-takeaway-favors": {
    id: "luxury-takeaway-favors",
    name: "Luxury Takeaway Favors",
    description: "Premium guest favors to remember the experience.",
    priceCents: 12500,
    allowQuantity: false,
    maxQuantity: 1
  },
  "custom-signage": {
    id: "custom-signage",
    name: "Custom Signage",
    description: "Branded or celebration-specific signage for the experience.",
    priceCents: 8500,
    allowQuantity: false,
    maxQuantity: 1
  }
};

export const bookingExperiences: BookingExperience[] = [
  {
    id: "mobile-fragrance-bar",
    slug: "mobile-fragrance-bar",
    title: "Mobile Fragrance Bar",
    description:
      "We bring the fragrance experience to you. A luxurious, hands-on scent experience your guests will love.",
    imageSrc: "/images/house-of-denise/mobile-fragrance-bar.png",
    imageAlt: "Mobile fragrance bar with perfume bottles and florals",
    startingPriceCents: 85000,
    durationLabel: "2–3 Hours",
    guestRangeLabel: "1–100 Guests",
    minGuests: 1,
    maxGuests: 100,
    durationMinutes: 150,
    packageIds: ["essential", "signature", "luxury", "custom"],
    upgradeIds: [
      "additional-guests",
      "custom-labels",
      "gift-packaging",
      "travel-outside-area",
      "extra-fragrance-station",
      "extended-event-time",
      "decor-upgrade",
      "luxury-takeaway-favors",
      "custom-signage"
    ],
    depositPercent: 30,
    serviceFeeCents: SERVICE_FEE_DEFAULT_CENTS
  },
  {
    id: "private-events",
    slug: "private-events",
    title: "Private Events",
    description:
      "Elevate your special moments with a custom fragrance experience tailored for your guests.",
    imageSrc: "/images/house-of-denise/private-events.jpg",
    imageAlt: "Private events table setting with House of Denise branding",
    startingPriceCents: 125000,
    durationLabel: "2–4 Hours",
    guestRangeLabel: "1–100 Guests",
    minGuests: 1,
    maxGuests: 100,
    durationMinutes: 180,
    mostPopular: true,
    packageIds: ["signature", "luxury", "custom"],
    upgradeIds: [
      "additional-guests",
      "custom-labels",
      "gift-packaging",
      "travel-outside-area",
      "decor-upgrade",
      "luxury-takeaway-favors",
      "custom-signage",
      "extended-event-time"
    ],
    depositPercent: 30,
    serviceFeeCents: SERVICE_FEE_DEFAULT_CENTS
  },
  {
    id: "luxury-workshops",
    slug: "luxury-workshops",
    title: "Luxury Workshops",
    description:
      "An immersive, hands-on fragrance workshop where guests create their own signature scent.",
    imageSrc: "/images/house-of-denise/luxury-workshops.jpg",
    imageAlt: "Workshop setup with dropper bottles and scent strips",
    startingPriceCents: 95000,
    durationLabel: "1.5–2.5 Hours",
    guestRangeLabel: "1–100 Guests",
    minGuests: 1,
    maxGuests: 100,
    durationMinutes: 120,
    packageIds: ["essential", "signature", "luxury", "custom"],
    upgradeIds: [
      "additional-guests",
      "custom-labels",
      "gift-packaging",
      "extended-event-time",
      "decor-upgrade",
      "luxury-takeaway-favors"
    ],
    depositPercent: 30,
    serviceFeeCents: 9500
  },
  {
    id: "perfume-bar-experience",
    slug: "perfume-bar-experience",
    title: "Perfume Bar Experience",
    description:
      "A guided scent-discovery experience with expert recommendations and curated blends.",
    imageSrc: "/images/house-of-denise/shop-perfume-bar.jpg",
    imageAlt: "Perfume bar display with fragrance bottles",
    startingPriceCents: 60000,
    durationLabel: "1–2 Hours",
    guestRangeLabel: "1–100 Guests",
    minGuests: 1,
    maxGuests: 100,
    durationMinutes: 90,
    packageIds: ["essential", "signature", "luxury", "custom"],
    upgradeIds: [
      "additional-guests",
      "custom-labels",
      "gift-packaging",
      "extra-fragrance-station",
      "extended-event-time",
      "custom-signage"
    ],
    depositPercent: 30,
    serviceFeeCents: 8500
  }
];

export function getExperience(id: string | null | undefined): BookingExperience | undefined {
  return bookingExperiences.find((item) => item.id === id);
}

export function getPackage(id: string | null | undefined): BookingPackage | undefined {
  if (!id) return undefined;
  return bookingPackages[id as BookingPackageId];
}

export function getUpgrade(id: string | null | undefined): BookingUpgrade | undefined {
  if (!id) return undefined;
  return bookingUpgrades[id as BookingUpgradeId];
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}
