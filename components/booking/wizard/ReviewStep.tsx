"use client";

import { preferredContactOptions } from "@/data/booking-catalog";
import { getExperience, getPackage, formatUsdFromCents } from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";
import { useBookingWizard } from "./BookingWizardProvider";
import { useState } from "react";
import Link from "next/link";

export function ReviewStep() {
  const { state, dispatch, pricing, goToStep, nextStep, prevStep } = useBookingWizard();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const experience = getExperience(state.selectedExperienceId);
  const pkg = getPackage(state.selectedPackageId);

  function validate() {
    const next: Record<string, string> = {};
    if (!state.customer.fullName.trim()) next.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customer.email)) {
      next.email = "Enter a valid email.";
    }
    if (!state.customer.phone.trim()) next.phone = "Phone is required.";
    if (!state.customer.preferredContactMethod) {
      next.preferredContactMethod = "Select a preferred contact method.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <section className="bw-panel" aria-labelledby="review-title">
      <header className="bw-panel__header">
        <p className="lux-eyebrow">STEP 5</p>
        <h2 id="review-title">Customer Information & Review</h2>
        <p>
          Confirm your details.{" "}
          <Link href="/login?next=/booking" className="bw-inline-link">
            Sign in
          </Link>{" "}
          to save this booking to your account.
        </p>
      </header>

      <div className="bw-form-grid">
        <label className="bw-field">
          <span>Full Name</span>
          <input
            type="text"
            value={state.customer.fullName}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { fullName: e.target.value } })}
          />
          {submitted && errors.fullName ? <em>{errors.fullName}</em> : null}
        </label>
        <label className="bw-field">
          <span>Email</span>
          <input
            type="email"
            value={state.customer.email}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { email: e.target.value } })}
          />
          {submitted && errors.email ? <em>{errors.email}</em> : null}
        </label>
        <label className="bw-field">
          <span>Phone</span>
          <input
            type="tel"
            value={state.customer.phone}
            onChange={(e) => dispatch({ type: "SET_CUSTOMER", customer: { phone: e.target.value } })}
          />
          {submitted && errors.phone ? <em>{errors.phone}</em> : null}
        </label>
        <label className="bw-field">
          <span>Preferred Contact Method</span>
          <select
            value={state.customer.preferredContactMethod}
            onChange={(e) =>
              dispatch({
                type: "SET_CUSTOMER",
                customer: {
                  preferredContactMethod: e.target.value as typeof state.customer.preferredContactMethod
                }
              })
            }
          >
            <option value="">Select preference</option>
            {preferredContactOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {submitted && errors.preferredContactMethod ? <em>{errors.preferredContactMethod}</em> : null}
        </label>
      </div>

      <div className="bw-review-grid">
        <article className="bw-review-card">
          <header>
            <h3>Experience</h3>
            <button type="button" onClick={() => goToStep(0)}>
              Edit
            </button>
          </header>
          <p>{experience?.title}</p>
          <p>{pkg?.name}</p>
        </article>
        <article className="bw-review-card">
          <header>
            <h3>Schedule</h3>
            <button type="button" onClick={() => goToStep(3)}>
              Edit
            </button>
          </header>
          <p>
            {state.schedule.date} · {state.schedule.timeLabel}
          </p>
          <p>{experience?.durationLabel}</p>
        </article>
        <article className="bw-review-card">
          <header>
            <h3>Event</h3>
            <button type="button" onClick={() => goToStep(1)}>
              Edit
            </button>
          </header>
          <p>
            {state.eventDetails.guestCount} guests · {state.eventDetails.occasion}
          </p>
          <p>
            {state.eventDetails.venueName}
            <br />
            {state.eventDetails.address}
          </p>
        </article>
        <article className="bw-review-card">
          <header>
            <h3>Estimate</h3>
            <button type="button" onClick={() => goToStep(2)}>
              Edit
            </button>
          </header>
          {pricing ? (
            <>
              <p>Package: {formatUsdFromCents(pricing.packagePriceCents)}</p>
              <p>Upgrades: {formatUsdFromCents(pricing.upgradeTotalCents)}</p>
              <p>Service fee: {formatUsdFromCents(pricing.serviceFeeCents)}</p>
              <p>
                <strong>Subtotal: {formatUsdFromCents(pricing.subtotalCents)}</strong>
              </p>
            </>
          ) : (
            <p>Custom pricing requires consultation.</p>
          )}
        </article>
      </div>

      <div className="bw-step-actions">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setSubmitted(true);
            if (validate()) nextStep();
          }}
        >
          Continue to Payment
        </Button>
      </div>
    </section>
  );
}
