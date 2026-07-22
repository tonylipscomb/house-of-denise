"use client";

import Image from "next/image";
import { Instagram, X } from "lucide-react";
import { useState } from "react";
import { instagramGallery } from "@/data/home-content";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function InstagramGallerySection() {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const activeImage = instagramGallery.find((item) => item.id === activeImageId);

  return (
    <Section background="ivory" spacing="standard" className="instagram-gallery">
      <Container>
        <SectionHeader
          eyebrow="GALLERY"
          title="Moments Made To Linger"
          description="A glimpse at the textures, styling and fragrance details that shape the House Of Denise experience."
        />
        <div className="instagram-gallery__grid">
          {instagramGallery.map((item) => (
            <button
              type="button"
              className={`instagram-gallery__item instagram-gallery__item--${item.size}`}
              key={item.id}
              aria-label={`View ${item.imageAlt}`}
              onClick={() => setActiveImageId(item.id)}
            >
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                className="instagram-gallery__image"
                style={{ objectPosition: item.imagePosition }}
              />
              <span className="instagram-gallery__icon" aria-hidden="true">
                <Instagram size={18} strokeWidth={1.75} />
              </span>
            </button>
          ))}
        </div>
      </Container>
      {activeImage ? (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={activeImage.imageAlt}>
          <button type="button" className="gallery-lightbox__backdrop" aria-label="Close gallery" onClick={() => setActiveImageId(null)} />
          <div className="gallery-lightbox__panel">
            <button type="button" className="gallery-lightbox__close" aria-label="Close gallery" onClick={() => setActiveImageId(null)}>
              <X size={20} aria-hidden="true" />
            </button>
            <div className="gallery-lightbox__image-wrap">
              <Image
                src={activeImage.imageSrc}
                alt={activeImage.imageAlt}
                fill
                sizes="min(92vw, 980px)"
                className="gallery-lightbox__image"
                style={{ objectPosition: activeImage.imagePosition }}
              />
            </div>
            <p>{activeImage.imageAlt}</p>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
