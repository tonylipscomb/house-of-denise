"use client";

import Image from "next/image";
import { bookingExperiences, formatUsdFromCents } from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";
import { useBookingWizard } from "./BookingWizardProvider";
import { Clock3, Users, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/cn";

export function ExperienceSelector() {
  const { state, dispatch, nextStep } = useBookingWizard();

  return (
    <section className="bw-panel" aria-labelledby="choose-experience-title">
      <header className="bw-panel__header">
        <p className="lux-eyebrow">STEP 1</p>
        <h2 id="choose-experience-title">Choose Your Experience</h2>
        <p>Select the fragrance experience that best fits your celebration.</p>
      </header>

      <div className="bw-experience-grid">
        {bookingExperiences.map((experience) => {
          const selected = state.selectedExperienceId === experience.id;
          return (
            <article
              key={experience.id}
              className={cn("bw-experience-card", selected && "is-selected", experience.mostPopular && "is-popular")}
            >
              {experience.mostPopular ? <span className="bw-badge">Most Popular</span> : null}
              <div className="bw-experience-card__media">
                <Image
                  src={experience.imageSrc}
                  alt={experience.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="bw-experience-card__image"
                />
              </div>
              <div className="bw-experience-card__body">
                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
                <ul className="bw-meta-list">
                  <li>
                    <BadgeDollarSign size={16} aria-hidden="true" />
                    Starting at {formatUsdFromCents(experience.startingPriceCents)}
                  </li>
                  <li>
                    <Clock3 size={16} aria-hidden="true" />
                    {experience.durationLabel}
                  </li>
                  <li>
                    <Users size={16} aria-hidden="true" />
                    {experience.guestRangeLabel}
                  </li>
                </ul>
                <Button
                  variant={selected ? "gold" : "primary"}
                  fullWidth
                  onClick={() => {
                    dispatch({ type: "SELECT_EXPERIENCE", experienceId: experience.id });
                    nextStep();
                  }}
                >
                  {selected ? "Selected" : "Select Experience"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="bw-custom-callout">
        <div>
          <h3>Need something custom?</h3>
          <p>We’d love to create a fully personalized experience tailored to your vision and goals.</p>
        </div>
        <Button href="/contact" variant="outline">
          Inquire About a Custom Event
        </Button>
      </aside>
    </section>
  );
}
