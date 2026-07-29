import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  workshopHighlights,
  workshopOfferings,
  workshopSteps,
  workshopsPage
} from "@/data/workshops-content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Workshops",
  description:
    "Hands-on luxury fragrance workshops and perfume bar experiences from House Of Denise.",
  path: "/workshops"
});

export default function WorkshopsPage() {
  return (
    <div className="lux-workshops">
      <section className="lux-workshops__intro" aria-labelledby="workshops-title">
        <div className="lux-container lux-workshops__intro-inner">
          <p className="lux-eyebrow">{workshopsPage.eyebrow}</p>
          <h1 id="workshops-title">{workshopsPage.title}</h1>
          <p>{workshopsPage.description}</p>
          <div className="lux-workshops__intro-actions">
            <Button href="/booking" variant="primary" rightIcon={<ArrowRight size={17} aria-hidden="true" />}>
              Book a Workshop
            </Button>
            <Button href="/contact" variant="outline">
              Ask a Question
            </Button>
          </div>
        </div>
      </section>

      <section className="lux-workshops__notice-wrap" aria-labelledby="workshops-stay-tuned">
        <div className="lux-container">
          <aside className="lux-workshops__stay-tuned">
            <p className="lux-workshops__stay-tuned-eyebrow">{workshopsPage.stayTuned.eyebrow}</p>
            <span className="lux-workshops__stay-tuned-rule" aria-hidden="true" />
            <h2 id="workshops-stay-tuned" className="lux-workshops__stay-tuned-title">
              {workshopsPage.stayTuned.title}
            </h2>
            <p className="lux-workshops__stay-tuned-body">{workshopsPage.stayTuned.body}</p>
          </aside>
        </div>
      </section>

      <section className="lux-workshops__offerings" aria-labelledby="offerings-title">
        <div className="lux-container">
          <header className="lux-workshops__section-header">
            <p className="lux-eyebrow">Workshop Experiences</p>
            <h2 id="offerings-title">Choose the session that fits your celebration.</h2>
          </header>

          <div className="lux-workshops__grid">
            {workshopOfferings.map((workshop) => (
              <article key={workshop.id} className="lux-workshops__card">
                <div className="lux-workshops__card-media">
                  <Image
                    src={workshop.imageSrc}
                    alt={workshop.imageAlt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    className="lux-workshops__card-image"
                  />
                </div>
                <div className="lux-workshops__card-body">
                  <h3>{workshop.title}</h3>
                  <p>{workshop.description}</p>
                  <ul>
                    {workshop.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <Button href={workshop.href} variant="primary">
                    {workshop.ctaLabel}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-workshops__highlights" aria-labelledby="highlights-title">
        <div className="lux-container">
          <header className="lux-workshops__section-header lux-workshops__section-header--center">
            <p className="lux-eyebrow">Why Guests Love It</p>
            <h2 id="highlights-title">An experience that feels personal and elevated.</h2>
          </header>
          <ul className="lux-workshops__highlight-grid">
            {workshopHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <span className="lux-workshops__highlight-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.5} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="lux-workshops__steps" aria-labelledby="steps-title">
        <div className="lux-container lux-workshops__steps-inner">
          <header className="lux-workshops__section-header">
            <p className="lux-eyebrow">How It Works</p>
            <h2 id="steps-title">From inquiry to an unforgettable creative session.</h2>
          </header>
          <ol className="lux-workshops__step-list">
            {workshopSteps.map((step, index) => (
              <li key={step.id}>
                <span aria-hidden="true">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lux-workshops__cta" aria-labelledby="workshops-cta-title">
        <div className="lux-container lux-workshops__cta-inner">
          <div>
            <p className="lux-eyebrow lux-eyebrow--light">Ready to create</p>
            <h2 id="workshops-cta-title">Let&apos;s plan your workshop.</h2>
            <p>
              Whether you&apos;re celebrating with friends or hosting a private group, we&apos;ll
              help craft a fragrance experience that feels warm, polished, and memorable.
            </p>
          </div>
          <div className="lux-workshops__cta-actions">
            <Button href="/booking" variant="gold" rightIcon={<ArrowRight size={17} aria-hidden="true" />}>
              Start Booking
            </Button>
            <Button href="/contact" variant="outline" className="lux-workshops__cta-outline">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
