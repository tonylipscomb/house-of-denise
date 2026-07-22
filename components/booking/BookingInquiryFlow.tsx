"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import {
  bookingFieldLimits,
  contactMethodOptions,
  emptyBookingInquiry,
  eventTypeOptions,
  experienceFormatOptions,
  referralSourceOptions,
  type BookingInquiryFormData,
  type BookingSubmissionResponse,
  type BookingValidationErrors
} from "@/data/booking";
import { normalizeBookingInquiry, validateBookingInquiry } from "@/lib/booking-validation";
import { Button } from "@/components/ui/Button";
import { FormField, getFieldDescribedBy } from "@/components/ui/form/FormField";
import { Select } from "@/components/ui/form/Select";
import { TextArea } from "@/components/ui/form/TextArea";
import { TextInput } from "@/components/ui/form/TextInput";

const steps = ["Contact Details", "Event Details", "Experience Preferences", "Review and Submit"] as const;
type StepIndex = 0 | 1 | 2 | 3;

const stepFields: Record<StepIndex, Array<keyof BookingInquiryFormData>> = {
  0: ["fullName", "email", "phone", "preferredContactMethod"],
  1: ["eventType", "eventDate", "startTime", "eventCity", "eventState", "venueName", "estimatedGuestCount"],
  2: ["experienceFormat", "eventVision", "specialRequests", "referralSource"],
  3: ["consent"]
};

const consentCopy =
  "I understand that submitting this form is an event inquiry and does not confirm availability or reserve my date.";

function todayString() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function optionList(options: readonly string[], placeholder: string) {
  return (
    <>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ))}
    </>
  );
}

function formatValue(value: string | boolean) {
  if (typeof value === "boolean") return value ? "Acknowledged" : "Not acknowledged";
  return value || "Not provided";
}

function fieldErrorId(field: keyof BookingInquiryFormData) {
  return `booking-${field}-error`;
}

function ErrorSummary({
  errors,
  summaryRef
}: {
  errors: BookingValidationErrors;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div ref={summaryRef} className="booking-error-summary" tabIndex={-1} role="alert" aria-live="assertive">
      <h2>Please review the highlighted fields.</h2>
      <ul>
        {entries.map(([field, error]) => (
          <li key={field}>
            <a href={`#booking-${field}`}>{error}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewGroup({
  title,
  onEdit,
  rows
}: {
  title: string;
  onEdit: () => void;
  rows: Array<{ label: string; value: string | boolean }>;
}) {
  return (
    <section className="booking-review-group" aria-label={title}>
      <div className="booking-review-group__header">
        <h3>{title}</h3>
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      </div>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{formatValue(row.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function BookingInquiryFlow() {
  const [formData, setFormData] = useState<BookingInquiryFormData>(emptyBookingInquiry);
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [errors, setErrors] = useState<BookingValidationErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<BookingSubmissionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formStartedAt = useRef(new Date().toISOString());

  const normalized = useMemo(() => normalizeBookingInquiry(formData), [formData]);

  const setField = (field: keyof BookingInquiryFormData, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const moveFocus = () => {
    window.requestAnimationFrame(() => headingRef.current?.focus());
  };

  const validateStep = (step: StepIndex) => {
    const validation = validateBookingInquiry(normalized, { requireConsent: step === 3 });
    const relevantFields = new Set(stepFields[step]);
    const stepErrors = Object.fromEntries(
      Object.entries(validation.errors).filter(([field]) => relevantFields.has(field as keyof BookingInquiryFormData))
    ) as BookingValidationErrors;
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return false;
    }
    return true;
  };

  const goToStep = (step: StepIndex) => {
    setCurrentStep(step);
    setSubmitError("");
    moveFocus();
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, 3) as StepIndex);
    moveFocus();
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0) as StepIndex);
    setSubmitError("");
    moveFocus();
  };

  const submitInquiry = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...normalized,
          companyWebsite,
          formStartedAt: formStartedAt.current
        })
      });
      const payload = (await response.json()) as BookingSubmissionResponse;
      if (!payload.success) {
        setErrors(payload.errors);
        setSubmitError(payload.message);
        window.requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setSuccess(payload);
      window.requestAnimationFrame(() => headingRef.current?.focus());
    } catch {
      setSubmitError("We could not submit your inquiry right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success?.success) {
    return (
      <div className="booking-success" role="status" aria-live="polite">
        <CheckCircle2 size={42} strokeWidth={1.5} aria-hidden="true" />
        <p className="eyebrow">INQUIRY RECEIVED</p>
        <h1 ref={headingRef} tabIndex={-1}>
          Your inquiry has been received.
        </h1>
        <p>
          Thank you for considering House Of Denise. Your event details have been submitted for review. A member of the
          House Of Denise team will follow up regarding availability, planning, and deposit details.
        </p>
        <div className="booking-success__reference" aria-label="Inquiry reference">
          <span>Inquiry reference:</span>
          <strong>{success.referenceNumber}</strong>
        </div>
        <p className="booking-success__note">Please keep this reference number for your records.</p>
        <div className="button-row booking-success__actions">
          <Button href="/" variant="primary">
            Return Home
          </Button>
          <Button href="/perfume-bar" variant="outline">
            Explore the Fragrance Experience
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-flow">
      <aside className="booking-flow__aside" aria-label="Booking guidance">
        <p className="eyebrow">HOUSE OF DENISE BOOKING</p>
        <h2>Plan a fragrance experience with care.</h2>
        <p>
          Share the details House Of Denise needs to review your celebration and guide the next planning conversation.
        </p>
        <div className="booking-flow__note">
          This is an inquiry. Availability, deposit details, and final confirmation are reviewed after submission.
        </div>
      </aside>

      <div className="booking-flow__panel">
        <nav className="booking-progress" aria-label="Booking progress">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              className={index === currentStep ? "booking-progress__step booking-progress__step--active" : "booking-progress__step"}
              aria-current={index === currentStep ? "step" : undefined}
              onClick={() => {
                if (index <= currentStep) goToStep(index as StepIndex);
              }}
              disabled={index > currentStep}
            >
              <span>{index + 1}</span>
              {step}
            </button>
          ))}
        </nav>

        <ErrorSummary errors={errors} summaryRef={summaryRef} />
        {submitError ? (
          <div className="booking-submit-error" role="alert" aria-live="assertive">
            {submitError}
          </div>
        ) : null}

        <form className="booking-inquiry-form" aria-label="Fragrance experience inquiry form" noValidate>
          <div className="booking-honeypot" aria-hidden="true">
            <label htmlFor="booking-companyWebsite">Company website</label>
            <input
              id="booking-companyWebsite"
              name="companyWebsite"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={companyWebsite}
              onChange={(event) => setCompanyWebsite(event.target.value)}
            />
          </div>
          {currentStep === 0 ? (
            <section className="booking-step" aria-labelledby="booking-contact-heading">
              <h1 id="booking-contact-heading" ref={headingRef} tabIndex={-1}>
                Contact Details
              </h1>
              <div className="form-grid">
                <FormField id="booking-fullName" label="Full name" required error={errors.fullName}>
                  <TextInput
                    id="booking-fullName"
                    name="fullName"
                    value={formData.fullName}
                    maxLength={bookingFieldLimits.fullName}
                    autoComplete="name"
                    hasError={Boolean(errors.fullName)}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={getFieldDescribedBy("booking-fullName", undefined, errors.fullName)}
                    onChange={(event) => setField("fullName", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-email" label="Email" required error={errors.email}>
                  <TextInput
                    id="booking-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    maxLength={bookingFieldLimits.email}
                    autoComplete="email"
                    hasError={Boolean(errors.email)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={getFieldDescribedBy("booking-email", undefined, errors.email)}
                    onChange={(event) => setField("email", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-phone" label="Phone number" required error={errors.phone}>
                  <TextInput
                    id="booking-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    maxLength={bookingFieldLimits.phone}
                    autoComplete="tel"
                    hasError={Boolean(errors.phone)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={getFieldDescribedBy("booking-phone", undefined, errors.phone)}
                    onChange={(event) => setField("phone", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-preferredContactMethod" label="Preferred contact method" error={errors.preferredContactMethod}>
                  <Select
                    id="booking-preferredContactMethod"
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    hasError={Boolean(errors.preferredContactMethod)}
                    aria-invalid={Boolean(errors.preferredContactMethod)}
                    aria-describedby={getFieldDescribedBy(
                      "booking-preferredContactMethod",
                      undefined,
                      errors.preferredContactMethod
                    )}
                    onChange={(event) => setField("preferredContactMethod", event.target.value)}
                  >
                    {optionList(contactMethodOptions, "Choose a contact method")}
                  </Select>
                </FormField>
              </div>
            </section>
          ) : null}

          {currentStep === 1 ? (
            <section className="booking-step" aria-labelledby="booking-event-heading">
              <h1 id="booking-event-heading" ref={headingRef} tabIndex={-1}>
                Event Details
              </h1>
              <div className="form-grid">
                <FormField id="booking-eventType" label="Event type" required error={errors.eventType}>
                  <Select
                    id="booking-eventType"
                    name="eventType"
                    value={formData.eventType}
                    hasError={Boolean(errors.eventType)}
                    aria-invalid={Boolean(errors.eventType)}
                    aria-describedby={getFieldDescribedBy("booking-eventType", undefined, errors.eventType)}
                    onChange={(event) => setField("eventType", event.target.value)}
                  >
                    {optionList(eventTypeOptions, "Select event type")}
                  </Select>
                </FormField>
                <FormField id="booking-eventDate" label="Event date" required error={errors.eventDate}>
                  <TextInput
                    id="booking-eventDate"
                    name="eventDate"
                    type="date"
                    min={todayString()}
                    value={formData.eventDate}
                    hasError={Boolean(errors.eventDate)}
                    aria-invalid={Boolean(errors.eventDate)}
                    aria-describedby={getFieldDescribedBy("booking-eventDate", undefined, errors.eventDate)}
                    onChange={(event) => setField("eventDate", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-startTime" label="Start time if known">
                  <TextInput
                    id="booking-startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(event) => setField("startTime", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-estimatedGuestCount" label="Estimated guest count" required error={errors.estimatedGuestCount}>
                  <TextInput
                    id="booking-estimatedGuestCount"
                    name="estimatedGuestCount"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={formData.estimatedGuestCount}
                    hasError={Boolean(errors.estimatedGuestCount)}
                    aria-invalid={Boolean(errors.estimatedGuestCount)}
                    aria-describedby={getFieldDescribedBy(
                      "booking-estimatedGuestCount",
                      undefined,
                      errors.estimatedGuestCount
                    )}
                    onChange={(event) => setField("estimatedGuestCount", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-eventCity" label="Event city" required error={errors.eventCity}>
                  <TextInput
                    id="booking-eventCity"
                    name="eventCity"
                    value={formData.eventCity}
                    maxLength={bookingFieldLimits.eventCity}
                    autoComplete="address-level2"
                    hasError={Boolean(errors.eventCity)}
                    aria-invalid={Boolean(errors.eventCity)}
                    aria-describedby={getFieldDescribedBy("booking-eventCity", undefined, errors.eventCity)}
                    onChange={(event) => setField("eventCity", event.target.value)}
                  />
                </FormField>
                <FormField id="booking-eventState" label="Event state" required error={errors.eventState}>
                  <TextInput
                    id="booking-eventState"
                    name="eventState"
                    value={formData.eventState}
                    maxLength={bookingFieldLimits.eventState}
                    autoComplete="address-level1"
                    hasError={Boolean(errors.eventState)}
                    aria-invalid={Boolean(errors.eventState)}
                    aria-describedby={getFieldDescribedBy("booking-eventState", undefined, errors.eventState)}
                    onChange={(event) => setField("eventState", event.target.value)}
                  />
                </FormField>
              </div>
              <FormField id="booking-venueName" label="Venue name or location" error={errors.venueName}>
                <TextInput
                  id="booking-venueName"
                  name="venueName"
                  value={formData.venueName}
                  maxLength={bookingFieldLimits.venueName}
                  hasError={Boolean(errors.venueName)}
                  aria-invalid={Boolean(errors.venueName)}
                  aria-describedby={getFieldDescribedBy("booking-venueName", undefined, errors.venueName)}
                  onChange={(event) => setField("venueName", event.target.value)}
                />
              </FormField>
            </section>
          ) : null}

          {currentStep === 2 ? (
            <section className="booking-step" aria-labelledby="booking-preferences-heading">
              <h1 id="booking-preferences-heading" ref={headingRef} tabIndex={-1}>
                Experience Preferences
              </h1>
              <FormField id="booking-experienceFormat" label="Preferred experience format" error={errors.experienceFormat}>
                <Select
                  id="booking-experienceFormat"
                  name="experienceFormat"
                  value={formData.experienceFormat}
                  hasError={Boolean(errors.experienceFormat)}
                  aria-invalid={Boolean(errors.experienceFormat)}
                  aria-describedby={getFieldDescribedBy("booking-experienceFormat", undefined, errors.experienceFormat)}
                  onChange={(event) => setField("experienceFormat", event.target.value)}
                >
                  {optionList(experienceFormatOptions, "Choose an experience format")}
                </Select>
              </FormField>
              <FormField id="booking-eventVision" label="Tell us about your event" error={errors.eventVision}>
                <TextArea
                  id="booking-eventVision"
                  name="eventVision"
                  rows={5}
                  value={formData.eventVision}
                  maxLength={bookingFieldLimits.eventVision}
                  hasError={Boolean(errors.eventVision)}
                  aria-invalid={Boolean(errors.eventVision)}
                  aria-describedby={getFieldDescribedBy("booking-eventVision", undefined, errors.eventVision)}
                  onChange={(event) => setField("eventVision", event.target.value)}
                />
              </FormField>
              <FormField id="booking-specialRequests" label="Special requests or customization ideas" error={errors.specialRequests}>
                <TextArea
                  id="booking-specialRequests"
                  name="specialRequests"
                  rows={4}
                  value={formData.specialRequests}
                  maxLength={bookingFieldLimits.specialRequests}
                  hasError={Boolean(errors.specialRequests)}
                  aria-invalid={Boolean(errors.specialRequests)}
                  aria-describedby={getFieldDescribedBy("booking-specialRequests", undefined, errors.specialRequests)}
                  onChange={(event) => setField("specialRequests", event.target.value)}
                />
              </FormField>
              <FormField id="booking-referralSource" label="How did you hear about House Of Denise?" error={errors.referralSource}>
                <Select
                  id="booking-referralSource"
                  name="referralSource"
                  value={formData.referralSource}
                  hasError={Boolean(errors.referralSource)}
                  aria-invalid={Boolean(errors.referralSource)}
                  aria-describedby={getFieldDescribedBy("booking-referralSource", undefined, errors.referralSource)}
                  onChange={(event) => setField("referralSource", event.target.value)}
                >
                  {optionList(referralSourceOptions, "Choose one")}
                </Select>
              </FormField>
            </section>
          ) : null}

          {currentStep === 3 ? (
            <section className="booking-step" aria-labelledby="booking-review-heading">
              <h1 id="booking-review-heading" ref={headingRef} tabIndex={-1}>
                Review and Submit
              </h1>
              <p className="booking-review-intro">
                Please review your inquiry before sending it to House Of Denise.
              </p>
              <div className="booking-review">
                <ReviewGroup
                  title="Contact information"
                  onEdit={() => goToStep(0)}
                  rows={[
                    { label: "Full name", value: formData.fullName },
                    { label: "Email", value: formData.email },
                    { label: "Phone", value: formData.phone },
                    { label: "Preferred contact method", value: formData.preferredContactMethod }
                  ]}
                />
                <ReviewGroup
                  title="Event information"
                  onEdit={() => goToStep(1)}
                  rows={[
                    { label: "Event type", value: formData.eventType },
                    { label: "Event date", value: formData.eventDate },
                    { label: "Start time", value: formData.startTime },
                    { label: "Event city", value: formData.eventCity },
                    { label: "Event state", value: formData.eventState },
                    { label: "Venue or location", value: formData.venueName },
                    { label: "Estimated guest count", value: formData.estimatedGuestCount }
                  ]}
                />
                <ReviewGroup
                  title="Experience and notes"
                  onEdit={() => goToStep(2)}
                  rows={[
                    { label: "Selected experience", value: formData.experienceFormat },
                    { label: "Event vision", value: formData.eventVision },
                    { label: "Special requests", value: formData.specialRequests },
                    { label: "How they heard about House Of Denise", value: formData.referralSource }
                  ]}
                />
              </div>
              <div className={errors.consent ? "booking-consent booking-consent--error" : "booking-consent"}>
                <label htmlFor="booking-consent">
                  <input
                    id="booking-consent"
                    type="checkbox"
                    checked={formData.consent}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? fieldErrorId("consent") : undefined}
                    onChange={(event) => setField("consent", event.target.checked)}
                  />
                  <span>{consentCopy}</span>
                </label>
                {errors.consent ? (
                  <p id={fieldErrorId("consent")} className="field-error">
                    {errors.consent}
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <div className="booking-flow__actions">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" leftIcon={<ArrowLeft size={17} />} onClick={goBack}>
                Back
              </Button>
            ) : null}
            {currentStep < 3 ? (
              <Button type="button" variant="primary" rightIcon={<ArrowRight size={17} />} onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                loading={submitting}
                disabled={submitting}
                rightIcon={<Send size={17} />}
                onClick={submitInquiry}
              >
                Submit Inquiry
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
