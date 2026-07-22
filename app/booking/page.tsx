import { BookingInquiryFlow } from "@/components/booking/BookingInquiryFlow";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Book a Fragrance Experience",
  description:
    "Submit an inquiry to plan a House Of Denise fragrance experience for your birthday, shower, wedding, corporate event, or private celebration.",
  path: "/booking",
  image: "/images/house-of-denise/hero-lifestyle.png"
});

export default function BookingPage() {
  return (
    <Section background="cream" spacing="spacious" className="booking-inquiry-page">
      <Container>
        <BookingInquiryFlow />
      </Container>
    </Section>
  );
}
