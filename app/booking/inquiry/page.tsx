import { BookingInquiryFlow } from "@/components/booking/BookingInquiryFlow";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Booking Inquiry",
  description:
    "Submit an inquiry to plan a House Of Denise fragrance experience for your celebration.",
  path: "/booking/inquiry"
});

export default function BookingInquiryPage() {
  return (
    <Section background="cream" spacing="spacious" className="booking-inquiry-page">
      <Container>
        <BookingInquiryFlow />
      </Container>
    </Section>
  );
}
