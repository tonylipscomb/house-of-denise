import Image from "next/image";
import { Star } from "lucide-react";
import { bookingCta, homeTestimonial } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { Reveal } from "./Reveal";

export function TestimonialBookingCTA() {
  return (
    <section
      id="testimonials"
      className="lux-cta-band"
      aria-labelledby="booking-cta-title"
    >
      <div className="lux-container lux-cta-band__grid">
        <Reveal className="lux-cta-band__quote">
          <div className="lux-cta-band__stars" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            ))}
          </div>
          <blockquote>
            <p>“{homeTestimonial.quote}”</p>
            <footer>
              <cite>{homeTestimonial.name}</cite>
              <span>{homeTestimonial.eventType}</span>
            </footer>
          </blockquote>
        </Reveal>

        <Reveal className="lux-cta-band__media" delayMs={80}>
          <Image
            src={bookingCta.imageSrc}
            alt={bookingCta.imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 28vw"
            className="lux-cta-band__image"
          />
        </Reveal>

        <Reveal className="lux-cta-band__action" delayMs={140}>
          <p className="lux-eyebrow lux-eyebrow--light">{bookingCta.eyebrow}</p>
          <h2 id="booking-cta-title">{bookingCta.title}</h2>
          <p>{bookingCta.description}</p>
          <Button href={bookingCta.cta.href} variant="gold" size="lg">
            {bookingCta.cta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
