"use client";

import Image from "next/image";
import { BOOKING_WIZARD_STEPS } from "@/lib/booking-wizard/types";
import { useBookingWizard } from "./BookingWizardProvider";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export function BookingHero() {
  return (
    <section className="bw-hero" aria-labelledby="booking-hero-title">
      <div className="bw-hero__copy">
        <p className="lux-eyebrow">HOUSE OF DENISE</p>
        <h1 id="booking-hero-title">Book an Experience</h1>
        <p>
          Curated fragrance experiences, private events, workshops, and mobile fragrance bar
          bookings—designed to make every moment unforgettable.
        </p>
      </div>
      <div className="bw-hero__media">
        <Image
          src="/images/house-of-denise/signature-experience.jpg"
          alt="House of Denise gift packaging with perfume and ribbon"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 42vw"
          className="bw-hero__image"
        />
      </div>
    </section>
  );
}

export function BookingProgress() {
  const { state, goToStep } = useBookingWizard();

  return (
    <nav className="bw-progress" aria-label="Booking progress">
      <ol className="bw-progress__list">
        {BOOKING_WIZARD_STEPS.map((label, index) => {
          const step = index as 0 | 1 | 2 | 3 | 4 | 5;
          const completed = step < state.currentStep;
          const current = step === state.currentStep;
          return (
            <li key={label} className={cn("bw-progress__item", completed && "is-complete", current && "is-current")}>
              <button
                type="button"
                className="bw-progress__button"
                aria-current={current ? "step" : undefined}
                onClick={() => goToStep(step)}
              >
                <span className="bw-progress__marker" aria-hidden="true">
                  {completed ? <Check size={14} strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="bw-progress__label">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
