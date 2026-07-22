import Image from "next/image";
import { aboutTeaser, experienceToneItems } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function AboutTeaserSection() {
  return (
    <Section background="ivory" spacing="spacious" className="about-teaser-section">
      <Container className="about-teaser">
        <div className="about-teaser__visual" aria-label="Editorial House Of Denise founder story visual">
          <div className="about-teaser__frame">
            <Image
              src="/images/house-of-denise/hero-lifestyle.png"
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 38vw"
              className="about-teaser__image"
            />
            <span>Tasheika Meadows</span>
          </div>
        </div>
        <div className="about-teaser__copy">
          <SectionHeader
            eyebrow={aboutTeaser.eyebrow}
            title={aboutTeaser.title}
            description={aboutTeaser.description}
            titleAs="h2"
          />
          <div className="about-teaser__items">
            {experienceToneItems.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.id}>
                  <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </span>
              );
            })}
          </div>
          <Button href={aboutTeaser.cta.href} variant="outline">
            {aboutTeaser.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
