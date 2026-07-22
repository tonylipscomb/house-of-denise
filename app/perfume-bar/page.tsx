import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  bookingPathway,
  bookingSteps,
  customizationOptions,
  eventTypes,
  experienceFormats,
  finalFragranceCta,
  fragranceBenefits,
  fragranceFaqs,
  fragranceHero,
  fragranceSteps,
  fragranceValues,
  galleryItems,
  introPoints
} from "@/data/fragrance-experience";
import { FragranceGallery } from "@/components/fragrance/FragranceGallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { createPageMetadata } from "@/lib/metadata";

const metadataDescription =
  "Request the House Of Denise mobile fragrance bar for weddings, private events, corporate fragrance experiences, custom perfume workshops, and elegant celebrations.";

export const metadata = createPageMetadata({
  title: "Signature Fragrance Experience",
  description: metadataDescription,
  path: "/perfume-bar",
  image: fragranceHero.image.src
});

function FragranceServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "House Of Denise Mobile Fragrance Bar",
    serviceType: "Mobile fragrance bar and custom perfume workshop for events",
    provider: {
      "@type": "LocalBusiness",
      name: "House Of Denise",
      url: "https://houseofdenise.com/"
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Virginia"
    },
    description: metadataDescription,
    url: "https://houseofdenise.com/perfume-bar",
    image: "https://houseofdenise.com/images/house-of-denise/hero-lifestyle.png"
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function PerfumeBarPage() {
  return (
    <>
      <FragranceServiceSchema />
      <section className="fragrance-hero" aria-labelledby="fragrance-hero-title">
        <Container className="fragrance-hero__inner">
          <div className="fragrance-hero__copy">
            <p className="eyebrow">{fragranceHero.eyebrow}</p>
            <h1 id="fragrance-hero-title">{fragranceHero.heading}</h1>
            <p className="fragrance-hero__body">{fragranceHero.body}</p>
            <div className="button-row fragrance-hero__actions">
              <Button href={fragranceHero.primaryCta.href} variant="primary" rightIcon={<ArrowRight size={17} />}>
                {fragranceHero.primaryCta.label}
              </Button>
              <Button href={fragranceHero.secondaryCta.href} variant="outline">
                {fragranceHero.secondaryCta.label}
              </Button>
            </div>
            <p className="fragrance-hero__support">
              <Sparkles size={16} strokeWidth={1.5} aria-hidden="true" />
              {fragranceHero.supportLine}
            </p>
          </div>
          <div className="fragrance-hero__media">
            <Image
              src={fragranceHero.image.src}
              alt={fragranceHero.image.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 900px) 100vw, 50vw"
              className="fragrance-hero__image"
              style={{ objectPosition: fragranceHero.image.position }}
            />
          </div>
        </Container>
      </section>

      <Section background="ivory" spacing="spacious" className="fragrance-intro">
        <Container className="fragrance-intro__grid">
          <div>
            <p className="eyebrow">A MOMENT DESIGNED AROUND YOU</p>
            <h2>More than fragrance.</h2>
          </div>
          <div className="fragrance-intro__copy">
            <p className="lead">
              House Of Denise combines fragrance, self-care, and hospitality into one elevated hands-on experience.
              Guests are guided through scent discovery, blending, and personalization in an atmosphere designed around
              connection, creativity, and celebration.
            </p>
            <p className="fragrance-intro__quote">Fragrance becomes the detail guests remember.</p>
            <div className="fragrance-intro__points">
              {introPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <span key={point.id}>
                    <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                    {point.text}
                  </span>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      <Section background="cream" spacing="spacious" className="fragrance-journey">
        <Container>
          <SectionHeader
            eyebrow="WHAT THE EXPERIENCE IS"
            title="A guided fragrance bar brought to your venue."
            description="The experience is hosted, styled, and adapted to the event after House Of Denise reviews the inquiry."
            align="center"
          />
          <div className="fragrance-steps">
            {fragranceSteps.map((step, index) => (
              <article className="fragrance-step" key={step.id}>
                <span className="fragrance-step__marker">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory" spacing="spacious">
        <Container>
          <SectionHeader
            eyebrow="WHAT IS INCLUDED"
            title="A complete fragrance experience"
            description="Every guest experience is shaped with care, presentation, and personal participation at the center."
          />
          <div className="fragrance-benefits">
            {fragranceBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article className="fragrance-benefit" key={benefit.id}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              );
            })}
          </div>
          <p className="fragrance-pricing-note">
            Event pricing may include a base event fee plus guest-based costs. Final details are confirmed during
            consultation and booking.
          </p>
        </Container>
      </Section>

      <Section background="cream" spacing="spacious">
        <Container>
          <SectionHeader
            eyebrow="PERFECT FOR"
            title="Made for moments worth celebrating."
            description="The Signature Fragrance Experience can be planned for intimate gatherings, milestone celebrations, and larger hosted events."
          />
          <div className="fragrance-event-grid">
            {eventTypes.map((eventType) => (
              <article className="fragrance-event-card" key={eventType.id}>
                <div className="fragrance-event-card__media">
                  <Image
                    src={eventType.image.src}
                    alt={eventType.image.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                    className="fragrance-event-card__image"
                    style={{ objectPosition: eventType.image.position }}
                  />
                </div>
                <div className="fragrance-event-card__body">
                  <h3>{eventType.title}</h3>
                  <p>{eventType.description}</p>
                  <Link href={eventType.href} className="fragrance-text-link">
                    {eventType.linkLabel} <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ivory" spacing="spacious">
        <Container>
          <SectionHeader
            eyebrow="EXPERIENCE FORMATS"
            title="Choose the experience that fits your event."
            description="No fixed package assumptions here. House Of Denise reviews your event details and planning needs during the inquiry process."
          />
          <div className="fragrance-format-grid">
            {experienceFormats.map((format) => {
              const Icon = format.icon;
              return (
                <article className="fragrance-format-card" key={format.id}>
                  <span className="fragrance-format-card__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3>{format.title}</h3>
                  <p>{format.suitedFor}</p>
                  <p>{format.planningNote}</p>
                  <Button href={format.cta.href} variant="outline" fullWidth>
                    {format.cta.label}
                  </Button>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section background="cream" spacing="spacious" className="fragrance-customization">
        <Container>
          <SectionHeader
            eyebrow="CUSTOMIZATION"
            title="Personalized around your event."
            description="Fragrance direction, visual styling, guest flow, labels, keepsakes, and branded details can be reviewed based on the selected package and availability."
            align="center"
          />
          <div className="fragrance-customization__grid">
            {customizationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <article className="fragrance-customization__item" key={option.id}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section background="cream" spacing="spacious" className="fragrance-gallery-section">
        <Container>
          <SectionHeader eyebrow="VISUAL GALLERY" title="An experience designed to be remembered." align="center" />
          <FragranceGallery items={galleryItems} />
        </Container>
      </Section>

      <Section background="ivory" spacing="spacious">
        <Container className="fragrance-why">
          <div className="fragrance-why__copy">
            <p className="eyebrow">THE HOUSE OF DENISE DIFFERENCE</p>
            <h2>Luxury with meaning.</h2>
            <p className="lead">
              What sets House Of Denise apart is the ability to combine fragrance, self-care, creativity, and
              hospitality into one elevated experience. The mobile fragrance bar transforms celebrations into memorable
              moments where guests create something personal to take home.
            </p>
          </div>
          <div className="fragrance-values">
            {fragranceValues.map((value) => {
              const Icon = value.icon;
              return (
                <article className="fragrance-value" key={value.id}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section background="cream" spacing="spacious" className="fragrance-booking-pathway" id="fragrance-how-it-works">
        <Container className="fragrance-booking-pathway__inner">
          <div>
            <p className="eyebrow">BOOKING PATHWAY</p>
            <h2>{bookingPathway.heading}</h2>
            <p className="lead">{bookingPathway.body}</p>
            <div className="button-row">
              <Button href={bookingPathway.primaryCta.href} variant="primary">
                {bookingPathway.primaryCta.label}
              </Button>
              <Button href={bookingPathway.secondaryCta.href} variant="outline">
                {bookingPathway.secondaryCta.label}
              </Button>
            </div>
          </div>
          <ol className="fragrance-booking-steps">
            {bookingSteps.map((step, index) => (
              <li key={step.id}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section background="ivory" spacing="spacious">
        <Container narrow>
          <SectionHeader eyebrow="FAQ" title="Fragrance experience questions" align="center" />
          <div className="fragrance-faq-list">
            {fragranceFaqs.map((faq) => (
              <details className="faq-item fragrance-faq-item" key={faq.id}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="espresso" spacing="spacious" className="fragrance-final-cta">
        <Container className="fragrance-final-cta__inner">
          <div className="fragrance-final-cta__motif" aria-hidden="true" />
          <p className="eyebrow light">HOUSE OF DENISE</p>
          <h2>{finalFragranceCta.heading}</h2>
          <p>{finalFragranceCta.body}</p>
          <div className="button-row fragrance-final-cta__actions">
            <Button href={finalFragranceCta.primaryCta.href} variant="secondary" rightIcon={<Check size={17} />}>
              {finalFragranceCta.primaryCta.label}
            </Button>
            <Button href={finalFragranceCta.secondaryCta.href} variant="outline" className="fragrance-final-cta__outline">
              {finalFragranceCta.secondaryCta.label}
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
