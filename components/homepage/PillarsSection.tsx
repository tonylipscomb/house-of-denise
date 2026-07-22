import { homePillars } from "@/data/home-content";
import { FeatureCard } from "@/components/cards/FeatureCard";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function PillarsSection() {
  return (
    <Section background="cream" spacing="standard">
      <Container>
        <SectionHeader
          eyebrow="FEATURED SERVICES"
          title="Designed for celebrations with scent at the center."
          description="Choose a refined fragrance experience for private events, workshops, gifting or guest-centered celebrations."
          titleAs="h2"
          className="pillars-heading"
          align="center"
        />
        <Grid columns={4} gap="4" className="pillar-grid">
          {homePillars.map((pillar) => (
            <FeatureCard key={pillar.id} feature={pillar} />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
