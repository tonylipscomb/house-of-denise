import { ExperienceCard } from "@/components/cards/ExperienceCard";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/layout/PageShell";
import { experiences } from "@/data/catalog";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Experiences",
  description: "Creative workshops, fragrance experiences, and private gatherings at House Of Denise.",
  path: "/experiences"
});

export default function ExperiencesPage() {
  return (
    <>
      <Section background="cream" spacing="spacious" className="page-hero">
        <PageShell
          eyebrow="CRAFT. CREATE. CONNECT."
          title="Creative experiences worth remembering."
          description="Come learn, celebrate, blend, paint, pour, and make something beautiful."
        />
      </Section>
      <Section spacing="standard">
        <Container>
          <Grid columns={3} gap="5" className="experience-grid">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </Grid>
        </Container>
      </Section>
      <Section spacing="standard" id="perfume">
        <Container narrow className="split-feature">
          <div className="experience-scene" aria-hidden="true">
            <div className="perfume-bottle bottle-one" />
            <div className="perfume-bottle bottle-two" />
          </div>
          <div>
            <p className="eyebrow">PERFUME BAR</p>
            <h2>Blend a fragrance that tells your story.</h2>
            <p className="lead">
              Explore scent families, combine fragrance oils, name your blend, and bottle your own signature perfume.
            </p>
            <Button href="/perfume-bar" variant="primary">
              Explore the Perfume Bar
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
