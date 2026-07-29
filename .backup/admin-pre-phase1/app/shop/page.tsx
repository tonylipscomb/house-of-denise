import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Gift, Heart, Lock, Mail, Sparkles } from "lucide-react";
import { ShopNotifyForm } from "@/components/shop/ShopNotifyForm";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Shop — Coming Soon",
  description:
    "Something beautiful is on the way. Be the first to experience House of Denise luxury fragrances, gifts, and self-care essentials."
};

const valueProps = [
  {
    icon: Mail,
    title: "Be the first to know",
    copy: "Early access alerts the moment our collection launches."
  },
  {
    icon: Gift,
    title: "Exclusive offers",
    copy: "Subscriber-only gifts and launch-day courtesies."
  },
  {
    icon: Heart,
    title: "Curated with care",
    copy: "Every piece chosen for warmth, beauty, and intention."
  },
  {
    icon: Sparkles,
    title: "Experiences that inspire",
    copy: "Fragrance moments designed to linger long after."
  }
] as const;

const gallery = [
  {
    title: "Luxury Fragrances",
    src: "/images/house-of-denise/shop-perfume-bar.jpg",
    alt: "Perfume bottles arranged on a styled fragrance bar"
  },
  {
    title: "Thoughtful Gifts",
    src: "/images/house-of-denise/shop-custom-gift-set.jpg",
    alt: "Custom fragrance gift set with ribbon and packaging"
  },
  {
    title: "Self-Care Essentials",
    src: "/images/house-of-denise/signature-experience.jpg",
    alt: "House of Denise gift box with perfume and dried florals"
  }
] as const;

function Flourish({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 14c8-10 16-10 30-2 14 8 22 8 30-2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M32 4c1.5 3 1.5 6 0 9M28 8h8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ShopPage() {
  return (
    <div className={`shop-soon ${greatVibes.variable}`}>
      <section className="shop-soon__hero" aria-labelledby="shop-soon-title">
        <div className="shop-soon__hero-copy">
          <p className="lux-eyebrow shop-soon__eyebrow">Shop</p>
          <h1 id="shop-soon-title" className="shop-soon__title">
            <span className="shop-soon__title-main">Something beautiful</span>
            <span className="shop-soon__title-script">is on the way</span>
          </h1>
          <Flourish className="shop-soon__flourish" />
          <p className="shop-soon__lead">
            We&apos;re preparing a curated collection of luxury fragrances, thoughtful
            gifts, and self-care essentials—crafted with the same warmth and intention
            as every House of Denise experience.
          </p>
          <a className="btn btn--primary shop-soon__hero-cta" href="#notify">
            Notify Me When We Launch
          </a>
        </div>
        <div className="shop-soon__hero-media">
          <Image
            src="/images/house-of-denise/custom-gift-set.jpg"
            alt="House of Denise candle, perfume, and gift box styled on silk"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className="shop-soon__hero-image"
          />
        </div>
      </section>

      <section className="shop-soon__values" aria-label="Why join the list">
        <div className="lux-container shop-soon__values-inner">
          {valueProps.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="shop-soon__value">
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shop-soon__notify" id="notify" aria-labelledby="notify-title">
        <div className="lux-container shop-soon__notify-inner">
          <h2 id="notify-title">Be the first to experience what&apos;s coming.</h2>
          <p>Join the list for launch updates, early access, and exclusive offers.</p>
          <ShopNotifyForm />
          <p className="shop-soon__privacy">
            <Lock size={14} aria-hidden="true" />
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <section className="shop-soon__gallery" aria-labelledby="gallery-title">
        <div className="shop-soon__gallery-intro">
          <Flourish className="shop-soon__flourish shop-soon__flourish--light" />
          <h2 id="gallery-title">A collection curated with purpose</h2>
          <p>
            While the shop prepares to open, explore our fragrance experiences—designed
            for celebrations, gatherings, and moments worth remembering.
          </p>
          <Link className="shop-soon__gallery-link" href="/booking">
            Explore Our Experiences →
          </Link>
        </div>
        {gallery.map((item) => (
          <article key={item.title} className="shop-soon__gallery-card">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 900px) 100vw, 25vw"
              className="shop-soon__gallery-image"
            />
            <div className="shop-soon__gallery-overlay" />
            <h3>{item.title}</h3>
          </article>
        ))}
      </section>
    </div>
  );
}
