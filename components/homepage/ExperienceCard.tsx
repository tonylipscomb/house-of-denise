import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomePillar } from "@/data/home-content";
import { Reveal } from "./Reveal";

export function ExperienceCard({ feature, delayMs = 0 }: { feature: HomePillar; delayMs?: number }) {
  return (
    <Reveal as="article" className="lux-card" delayMs={delayMs}>
      <Link href={feature.href} className="lux-card__media-link" aria-label={`${feature.linkLabel}: ${feature.title}`}>
        <div className="lux-card__media">
          <Image
            src={feature.imageSrc}
            alt={feature.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="lux-card__image"
            style={{ objectPosition: feature.imagePosition }}
          />
        </div>
      </Link>
      <div className="lux-card__body">
        <h3 className="lux-card__title">{feature.title}</h3>
        <p className="lux-card__description">{feature.description}</p>
        <Link href={feature.href} className="lux-card__link">
          {feature.linkLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </Reveal>
  );
}
