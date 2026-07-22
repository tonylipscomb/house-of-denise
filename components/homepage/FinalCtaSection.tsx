import { ArrowRight } from "lucide-react";
import { finalCta } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function FinalCtaSection() {
  return (
    <Section background="espresso" spacing="spacious" className="home-final-cta">
      <Container className="home-final-cta__inner">
        <p className="eyebrow light">{finalCta.eyebrow}</p>
        <h2>{finalCta.title}</h2>
        <p>{finalCta.description}</p>
        <Button href={finalCta.cta.href} variant="secondary" rightIcon={<ArrowRight size={17} aria-hidden="true" />}>
          {finalCta.cta.label}
        </Button>
      </Container>
    </Section>
  );
}
