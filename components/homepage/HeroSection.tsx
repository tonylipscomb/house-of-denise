import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { heroContent } from "@/data/home-content";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="lux-hero" aria-label="Welcome">
      <div className="lux-hero__copy">
        <div className="lux-hero__copy-inner lux-hero__animate">
          <p className="lux-eyebrow">{heroContent.eyebrow}</p>
          <h1 className="lux-hero__title">
            {heroContent.headingLines.map((line) => (
              <span key={line} className="lux-hero__title-line">
                {line}
              </span>
            ))}
          </h1>
          <p className="lux-hero__body">{heroContent.body}</p>
          <div className="lux-hero__actions">
            <Button href={heroContent.primaryCta.href} variant="primary" size="lg" rightIcon={<ArrowRight size={18} aria-hidden="true" />}>
              {heroContent.primaryCta.label}
            </Button>
            <Button href={heroContent.secondaryCta.href} variant="outline" size="lg">
              {heroContent.secondaryCta.label}
            </Button>
          </div>
          <ul className="lux-hero__trust">
            {heroContent.trustHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="lux-hero__media">
        <Image
          src={heroContent.image.src}
          alt={heroContent.image.alt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 58vw"
          className="lux-hero__image"
          style={{ objectPosition: heroContent.image.position }}
        />
        <div className="lux-hero__gradient" aria-hidden="true" />
      </div>
    </section>
  );
}
