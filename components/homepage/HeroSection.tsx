import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { heroContent } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function HeroSection() {
  return (
    <section className="hero" aria-label="Welcome">
      <div className="hero-copy">
        <Container className="hero-copy-inner" fullWidth>
          <p className="eyebrow">{heroContent.eyebrow}</p>
          <h1>{heroContent.heading}</h1>
          <p className="hero-text">{heroContent.body}</p>
          <div className="button-row">
            <Button
              href={heroContent.primaryCta.href}
              variant="primary"
              rightIcon={<ArrowRight size={17} aria-hidden="true" />}
            >
              {heroContent.primaryCta.label}
            </Button>
            <Button href={heroContent.secondaryCta.href} variant="outline">
              {heroContent.secondaryCta.label}
            </Button>
          </div>
          <p className="hero-tagline">
            <Sparkles size={16} strokeWidth={1.5} aria-hidden="true" />
            {heroContent.accent}
          </p>
        </Container>
      </div>
      <div className="hero-media">
        <Image
          src={heroContent.image.src}
          alt={heroContent.image.alt}
          fill
          priority
          sizes="(max-width: 900px) 100vw, 50vw"
          className="hero-image"
        />
      </div>
    </section>
  );
}
