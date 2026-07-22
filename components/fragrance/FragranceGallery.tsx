"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";
import type { FragranceGalleryItem } from "@/data/fragrance-experience";

export function FragranceGallery({ items }: { items: FragranceGalleryItem[] }) {
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const activeImage = items.find((item) => item.id === activeImageId);

  return (
    <>
      <div className="fragrance-gallery">
        {items.map((item) => (
          <button
            type="button"
            className={`fragrance-gallery__item fragrance-gallery__item--${item.size}`}
            key={item.id}
            aria-label={`View ${item.alt}`}
            onClick={() => setActiveImageId(item.id)}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              className="fragrance-gallery__image"
              style={{ objectPosition: item.position }}
            />
          </button>
        ))}
      </div>
      {activeImage ? (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={activeImage.alt}>
          <button
            type="button"
            className="gallery-lightbox__backdrop"
            aria-label="Close gallery"
            onClick={() => setActiveImageId(null)}
          />
          <div className="gallery-lightbox__panel">
            <button
              type="button"
              className="gallery-lightbox__close"
              aria-label="Close gallery"
              onClick={() => setActiveImageId(null)}
            >
              <X size={20} aria-hidden="true" />
            </button>
            <div className="gallery-lightbox__image-wrap">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="min(92vw, 980px)"
                className="gallery-lightbox__image"
                style={{ objectPosition: activeImage.position }}
              />
            </div>
            <p>{activeImage.alt}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
