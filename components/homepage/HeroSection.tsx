import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { heroContent } from "@/data/home-content";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="lux-hero" aria-label="Welcome">
      <div className="lux-container lux-hero__inner">
        <div className="lux-hero__copy lux-hero__animate">
          <p className="lux-eyebrow lux-hero__eyebrow">{heroContent.eyebrow}</p>
          <h1 className="lux-hero__title">{heroContent.heading}</h1>

          <div className="lux-hero__divider" aria-hidden="true">
            <span />
            <Sparkles size={14} strokeWidth={1.75} />
            <span />
          </div>

          <p className="lux-hero__body">{heroContent.body}</p>

          <ul className="lux-hero__features">
            {heroContent.features.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <span className="lux-hero__feature-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </li>
              );
            })}
          </ul>

          <div className="lux-hero__actions">
            <Button
              href={heroContent.primaryCta.href}
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={18} aria-hidden="true" />}
            >
              {heroContent.primaryCta.label}
            </Button>
          </div>
        </div>

        <div className="lux-hero__media">
          <Image
            src={heroContent.image.src}
            alt={heroContent.image.alt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            className="lux-hero__image"
            style={{ objectPosition: heroContent.image.position }}
          />
        </div>
      </div>
    </section>
  );
}
