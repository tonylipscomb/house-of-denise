export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  imageClass: string;
  imageSrc?: string;
  /** TODO: Awaiting Tasheika questionnaire - set when pricing is confirmed. */
  price: number | null;
  externalUrl?: string;
  availabilityStatus?: "coming-soon" | "available";
  featured?: boolean;
};

export type Experience = {
  id: string;
  name: string;
  description: string;
  imageClass: string;
  imageSrc?: string;
  href: string;
  /** TODO: Awaiting Tasheika questionnaire - set when schedule is confirmed. */
  scheduleLabel: string | null;
  /** TODO: Awaiting Tasheika questionnaire - set when pricing is confirmed. */
  price: number | null;
  featured?: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string | null;
  detail: string | null;
};

export type BrandValue = {
  id: string;
  title: string;
  description: string;
};

// TODO: Awaiting Tasheika questionnaire - replace with confirmed catalog.
export const products: Product[] = [
  {
    id: "signature-candle",
    name: "Signature Candle",
    category: "Candles",
    description: "A warm handcrafted candle made for intentional self-care rituals.",
    imageClass: "product-candle",
    price: null,
    featured: true
  },
  {
    id: "body-care-ritual",
    name: "Body Care Ritual",
    category: "Body Care",
    description: "A soft self-care essential designed for everyday restoration.",
    imageClass: "product-macrame",
    price: null,
    featured: true
  },
  {
    id: "fragrance-gift",
    name: "Fragrance Gift",
    category: "Fragrance",
    description: "A scent-inspired gift for meaningful celebrations and quiet moments.",
    imageClass: "product-ceramic",
    price: null,
    featured: true
  },
  {
    id: "intentional-gift-set",
    name: "The Intentional Gift Set",
    category: "Gift Sets",
    description: "A thoughtful collection of handcrafted favorites for gifting.",
    imageClass: "product-gift",
    price: null,
    featured: true
  }
];

// TODO: Awaiting Tasheika questionnaire - replace with confirmed schedule.
export const experiences: Experience[] = [
  {
    id: "creative-workshop",
    name: "Creative Workshop",
    description: "A guided session to learn, make, and connect in the studio.",
    imageClass: "event-ceramic",
    href: "/workshops",
    scheduleLabel: null,
    price: null,
    featured: true
  },
  {
    id: "perfume-bar",
    name: "Perfume Bar Experience",
    description: "Blend fragrance notes and leave with a scent that feels uniquely yours.",
    imageClass: "event-candle",
    href: "/perfume-bar",
    scheduleLabel: null,
    price: null,
    featured: true
  },
  {
    id: "private-gathering",
    name: "Private Creative Gathering",
    description: "Celebrate birthdays, showers, and team moments with a custom studio experience.",
    imageClass: "event-macrame",
    href: "/private-events",
    scheduleLabel: null,
    price: null,
    featured: true
  }
];

/** @deprecated Use experiences - kept for gradual migration. */
export const events = experiences;

// Placeholder testimonials only. Replace with verified client reviews before launch.
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "Placeholder testimonial for a future verified client review.",
    name: "Guest Name",
    detail: "Placeholder"
  },
  {
    id: "t2",
    quote: "Placeholder testimonial for a private fragrance event.",
    name: "Guest Name",
    detail: "Placeholder"
  },
  {
    id: "t3",
    quote: "Placeholder testimonial for a workshop attendee.",
    name: "Guest Name",
    detail: "Placeholder"
  }
];

export const brandValues: BrandValue[] = [
  { id: "care", title: "Made with care", description: "Every detail is handled intentionally." },
  { id: "inspire", title: "Designed to inspire", description: "Creativity for ordinary and special days." },
  { id: "gift", title: "Thoughtful gifting", description: "Beautiful options for the people you love." },
  { id: "fulfill", title: "Careful fulfillment", description: "Secure checkout, packaging, and delivery." }
];

export const featuredProducts = products.filter((p) => p.featured);
export const featuredExperiences = experiences.filter((e) => e.featured);
