import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomePillar } from "@/data/home-content";
import { Button } from "@/components/ui/Button";

export function FeatureCard({ feature }: { feature: HomePillar }) {
  const Icon = feature.icon;

  return (
    <article className="card feature-card">
      <div className="card__media feature-card__media">
        <Image
          src={feature.imageSrc}
          alt={feature.imageAlt}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
          className="feature-card__image"
          style={{ objectPosition: feature.imagePosition }}
        />
        <span className="feature-card__badge" aria-hidden="true">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
      <div className="card__body feature-card__body">
        <h3 className="card__title">{feature.title}</h3>
        <p className="card__description">{feature.description}</p>
        <div className="feature-card__actions">
          <Link href={feature.href} className="feature-card__link">
            {feature.linkLabel} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Button href={feature.bookingHref} variant="outline">
            Book Now
          </Button>
        </div>
      </div>
    </article>
  );
}
