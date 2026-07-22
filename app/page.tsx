import { AboutTeaserSection } from "@/components/homepage/AboutTeaserSection";
import { FaqPreviewSection } from "@/components/homepage/FaqPreviewSection";
import { FinalCtaSection } from "@/components/homepage/FinalCtaSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { InstagramGallerySection } from "@/components/homepage/InstagramGallerySection";
import { PillarsSection } from "@/components/homepage/PillarsSection";
import { SignatureExperienceSection } from "@/components/homepage/SignatureExperienceSection";
import { TestimonialsSection } from "@/components/homepage/TestimonialsSection";
import { TrustSection } from "@/components/homepage/TrustSection";
import { WhyHouseSection } from "@/components/homepage/WhyHouseSection";
import { brand } from "@/data/brand";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Luxury Fragrance Experiences",
  description:
    "House Of Denise creates luxury mobile fragrance bars, custom workshops, private events and self-care experiences for elegant celebrations.",
  path: "/",
  image: "/images/house-of-denise/hero-lifestyle.png"
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
    image: "https://houseofdenise.com/images/house-of-denise/hero-lifestyle.png",
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
      <TrustSection />
      <PillarsSection />
      <HowItWorksSection />
      <SignatureExperienceSection />
      <WhyHouseSection />
      <InstagramGallerySection />
      <TestimonialsSection />
      <AboutTeaserSection />
      <FaqPreviewSection />
      <FinalCtaSection />
    </>
  );
}
