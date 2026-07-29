import Image from "next/image";
import { signatureExperience } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "./Reveal";

export function SignatureExperienceSection() {
  return (
    <section className="lux-section lux-section--ivory" aria-labelledby="signature-title">
      <div className="lux-container lux-signature">
        <Reveal className="lux-signature__media">
          <Image
            src={signatureExperience.imageSrc}
            alt={signatureExperience.imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
            className="lux-signature__image"
          />
        </Reveal>

        <Reveal className="lux-signature__content" delayMs={120}>
          <p className="lux-eyebrow">{signatureExperience.eyebrow}</p>
          <h2 id="signature-title">{signatureExperience.heading}</h2>
          <p className="lux-signature__body">{signatureExperience.body}</p>

          <ul className="lux-icon-features">
            {signatureExperience.features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.id}>
                  <span className="lux-icon-features__icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.7} />
                  </span>
                  <span>{feature.label}</span>
                </li>
              );
            })}
          </ul>

          <Button href={signatureExperience.cta.href} variant="primary" size="lg">
            {signatureExperience.cta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
