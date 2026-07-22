import Image from "next/image";
import { Check } from "lucide-react";
import { signatureExperience } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export function SignatureExperienceSection() {
  return (
    <Section spacing="spacious" className="signature-experience">
      <Container className="signature-experience__inner">
        <div className="signature-experience__media">
          <Image
            src={signatureExperience.imageSrc}
            alt={signatureExperience.imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="signature-experience__image"
          />
        </div>
        <div className="signature-experience__copy">
          <p className="eyebrow">FEATURED EXPERIENCE</p>
          <h2>{signatureExperience.heading}</h2>
          <p className="lead">{signatureExperience.body}</p>
          <div className="signature-experience__list" aria-label="Perfect for">
            <p>Perfect for</p>
            <ul>
              {signatureExperience.perfectFor.map((occasion) => (
                <li key={occasion}>
                  <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                  {occasion}
                </li>
              ))}
            </ul>
          </div>
          <Button href={signatureExperience.cta.href} variant="primary">
            {signatureExperience.cta.label}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
