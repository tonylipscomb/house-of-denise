"use client";

import {
  eventTypeOptionsWizard,
  getExperience,
  indoorOutdoorOptions,
  occasionOptions
} from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";
import { useBookingWizard } from "./BookingWizardProvider";
import { useMemo, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gift,
  Home,
  MapPin,
  PencilLine,
  Users
} from "lucide-react";

export function EventDetailsStep() {
  const { state, dispatch, nextStep, prevStep } = useBookingWizard();
  const experience = getExperience(state.selectedExperienceId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const guestHint = useMemo(() => {
    if (!experience) return "";
    return `Typical range: ${experience.minGuests}–${experience.maxGuests} guests`;
  }, [experience]);

  function validate() {
    const next: Record<string, string> = {};
    const d = state.eventDetails;
    if (!d.occasion) next.occasion = "Select an occasion.";
    if (!d.eventType) next.eventType = "Select an event type.";
    if (!d.guestCount || d.guestCount < 1) next.guestCount = "Enter a guest count.";
    if (experience && d.guestCount) {
      if (d.guestCount < experience.minGuests || d.guestCount > experience.maxGuests) {
        next.guestCount = `Guest count should be between ${experience.minGuests} and ${experience.maxGuests}.`;
      }
    }
    if (!d.indoorOutdoor) next.indoorOutdoor = "Select indoor or outdoor.";
    if (!d.venueName.trim()) next.venueName = "Venue name is required.";
    if (!d.address.trim()) next.address = "Event address is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <section className="bw-panel" aria-labelledby="event-details-title">
      <header className="bw-panel__header">
        <p className="lux-eyebrow">STEP 2</p>
        <h2 id="event-details-title">Event Details</h2>
        <p>Tell us about your celebration so we can tailor the experience.</p>
      </header>

      <div className="bw-form-grid">
        <label className="bw-field">
          <span>
            <Gift size={14} aria-hidden="true" />
            Occasion
          </span>
          <select
            value={state.eventDetails.occasion}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: { occasion: e.target.value as typeof state.eventDetails.occasion }
              })
            }
          >
            <option value="">Select occasion</option>
            {occasionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {submitted && errors.occasion ? <em>{errors.occasion}</em> : null}
        </label>

        <label className="bw-field">
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            Event Type
          </span>
          <select
            value={state.eventDetails.eventType}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: { eventType: e.target.value as typeof state.eventDetails.eventType }
              })
            }
          >
            <option value="">Select event type</option>
            {eventTypeOptionsWizard.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {submitted && errors.eventType ? <em>{errors.eventType}</em> : null}
        </label>

        <label className="bw-field">
          <span>
            <Users size={14} aria-hidden="true" />
            Guest Count
          </span>
          <input
            type="number"
            min={1}
            value={state.eventDetails.guestCount ?? ""}
            placeholder={guestHint}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: { guestCount: e.target.value ? Number(e.target.value) : null }
              })
            }
          />
          <small>{guestHint}</small>
          {submitted && errors.guestCount ? <em>{errors.guestCount}</em> : null}
        </label>

        <label className="bw-field">
          <span>
            <Home size={14} aria-hidden="true" />
            Indoor or Outdoor
          </span>
          <select
            value={state.eventDetails.indoorOutdoor}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: {
                  indoorOutdoor: e.target.value as typeof state.eventDetails.indoorOutdoor
                }
              })
            }
          >
            <option value="">Select setting</option>
            {indoorOutdoorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {submitted && errors.indoorOutdoor ? <em>{errors.indoorOutdoor}</em> : null}
        </label>

        <label className="bw-field bw-field--full">
          <span>
            <Building2 size={14} aria-hidden="true" />
            Venue Name
          </span>
          <input
            type="text"
            value={state.eventDetails.venueName}
            onChange={(e) =>
              dispatch({ type: "SET_EVENT_DETAILS", details: { venueName: e.target.value } })
            }
          />
          {submitted && errors.venueName ? <em>{errors.venueName}</em> : null}
        </label>

        <label className="bw-field bw-field--full">
          <span>
            <MapPin size={14} aria-hidden="true" />
            Full Event Address
          </span>
          <input
            type="text"
            value={state.eventDetails.address}
            onChange={(e) =>
              dispatch({ type: "SET_EVENT_DETAILS", details: { address: e.target.value } })
            }
          />
          {submitted && errors.address ? <em>{errors.address}</em> : null}
        </label>

        <label className="bw-field bw-field--full">
          <span>
            <PencilLine size={14} aria-hidden="true" />
            Special Requests
          </span>
          <textarea
            rows={3}
            value={state.eventDetails.specialRequests}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: { specialRequests: e.target.value }
              })
            }
          />
        </label>

        <label className="bw-field">
          <span>
            <Accessibility size={14} aria-hidden="true" />
            Accessibility Needs
          </span>
          <textarea
            rows={3}
            value={state.eventDetails.accessibilityNeeds}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: { accessibilityNeeds: e.target.value }
              })
            }
          />
        </label>

        <label className="bw-field">
          <span>
            <ClipboardList size={14} aria-hidden="true" />
            Additional Notes
          </span>
          <textarea
            rows={3}
            value={state.eventDetails.additionalNotes}
            onChange={(e) =>
              dispatch({
                type: "SET_EVENT_DETAILS",
                details: { additionalNotes: e.target.value }
              })
            }
          />
        </label>
      </div>

      <div className="bw-step-actions">
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
          Back
        </Button>
        <Button
          variant="primary"
          rightIcon={<ChevronRight size={16} aria-hidden="true" />}
          onClick={() => {
            setSubmitted(true);
            if (validate()) nextStep();
          }}
        >
          Continue to Packages
        </Button>
      </div>
    </section>
  );
}
