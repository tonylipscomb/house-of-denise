import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { PageShell } from "@/components/layout/PageShell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Private Events",
  description: "Celebrate life's moments with a creative gathering at House Of Denise.",
  path: "/private-events"
});

export default function PrivateEventsPage() {
  return (
    <Section spacing="standard">
      <PageShell
        eyebrow="GATHER & CREATE"
        title="Private events"
        description="Birthdays, showers, team gatherings, and meaningful celebrations designed around creativity and connection."
      />
      <Container narrow>
        <InlineNotice>
          Private event inquiries are reviewed before availability, package details, deposit steps, and final planning are confirmed.
        </InlineNotice>
        <div className="page-actions">
          <Button href="/booking" variant="primary">
            Start an inquiry
          </Button>
          <Button href="/contact" variant="outline">
            Contact the studio
          </Button>
        </div>
      </Container>
    </Section>
  );
}
