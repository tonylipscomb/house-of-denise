import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Terms",
  description: "Website and inquiry terms for House Of Denise fragrance experiences and customer communications.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <Section background="cream" spacing="spacious">
      <Container narrow>
        <p className="eyebrow">HOUSE OF DENISE</p>
        <h1>Terms</h1>
        <div className="legal-copy">
          <p>
            Website content is provided for general information about House Of Denise products, workshops and private
            fragrance experiences.
          </p>
          <p>
            Submitting an inquiry does not reserve a date, confirm availability or create a confirmed booking. House Of
            Denise reviews each inquiry before sharing planning and deposit details.
          </p>
          <p>
            Final service details, pricing, cancellation terms and payment instructions are confirmed during the planning
            process.
          </p>
        </div>
      </Container>
    </Section>
  );
}
