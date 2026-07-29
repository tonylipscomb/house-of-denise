import { TestimonialBookingCTA } from "@/components/homepage/TestimonialBookingCTA";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { PillarsSection } from "@/components/homepage/PillarsSection";
import { SignatureExperienceSection } from "@/components/homepage/SignatureExperienceSection";
import { brand } from "@/data/brand";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Luxury Fragrance Experiences & Private Events",
  description:
    "Discover luxury fragrance workshops, mobile fragrance bars, private events, gift experiences, and curated self-care experiences from House of Denise.",
  path: "/",
  image: "/images/house-of-denise/hero-editorial.jpg"
});

function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brand.name,
    description: brand.description,
    url: "https://houseofdenise.com/",
    email: brand.email ?? "info@houseofdenise.com",
    telephone: brand.phone ?? "804-850-4222",
    image: "https://houseofdenise.com/images/house-of-denise/hero-editorial.jpg",
    founder: {
      "@type": "Person",
      name: "Tasheika Meadows"
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Virginia"
    },
    sameAs: []
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />
      <HeroSection />
      <PillarsSection />
      <SignatureExperienceSection />
      <HowItWorksSection />
      <TestimonialBookingCTA />
    </>
  );
}
