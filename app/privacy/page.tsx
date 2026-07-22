import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "Privacy information for House Of Denise inquiries, customer care and website communications.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <Section background="cream" spacing="spacious">
      <Container narrow>
        <p className="eyebrow">HOUSE OF DENISE</p>
        <h1>Privacy Policy</h1>
        <div className="legal-copy">
          <p>
            House Of Denise uses submitted contact and event details to respond to inquiries, provide customer care and
            support requested services.
          </p>
          <p>
            Do not submit payment-card details through inquiry forms. Booking, deposit and payment information should be
            shared only through approved payment channels after review.
          </p>
          <p>
            For privacy questions or updates to submitted information, contact House Of Denise at
            info@houseofdenise.com.
          </p>
        </div>
      </Container>
    </Section>
  );
}
