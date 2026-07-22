import { WorkshopCard } from "@/components/cards/WorkshopCard";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Section } from "@/components/ui/Section";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { PageShell } from "@/components/layout/PageShell";
import { experiences } from "@/data/catalog";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Workshops",
  description: "Hands-on creative workshops at House Of Denise.",
  path: "/workshops"
});

export default function WorkshopsPage() {
  const workshops = experiences.filter((e) => e.id !== "private-gathering");

  return (
    <Section spacing="standard">
      <PageShell
        eyebrow="LEARN & CREATE"
        title="Workshops"
        description="Guided studio sessions to learn, make, and connect."
      />
      <Container>
        <InlineNotice>Workshop dates and registration will be published once the studio schedule is confirmed.</InlineNotice>
        <Grid columns={3} gap="5" className="experience-grid">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
