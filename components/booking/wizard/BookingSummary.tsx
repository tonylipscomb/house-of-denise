"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  formatUsdFromCents,
  getExperience,
  getPackage,
  getUpgrade
} from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";
import { useBookingWizard } from "./BookingWizardProvider";
import {
  CalendarDays,
  Clock3,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
  X
} from "lucide-react";
import { cn } from "@/lib/cn";

export function BookingSummary({
  compact = false,
  onOpenDrawer
}: {
  compact?: boolean;
  onOpenDrawer?: () => void;
}) {
  const { state, pricing, dispatch } = useBookingWizard();
  const experience = getExperience(state.selectedExperienceId);
  const pkg = getPackage(state.selectedPackageId);

  if (compact) {
    return (
      <button type="button" className="bw-summary-bar" onClick={onOpenDrawer}>
        <span>
          {experience?.title ?? "Your booking"}
          {pricing ? ` · ${formatUsdFromCents(pricing.amountDueTodayCents)} due today` : ""}
        </span>
        <span>View summary</span>
      </button>
    );
  }

  return (
    <aside className="bw-summary" aria-label="Booking summary">
      <div className="bw-summary__crest">
        <Image
          src="/images/house-of-denise/hd-crest-gold.png"
          alt=""
          width={88}
          height={48}
          className="bw-summary__crest-img"
        />
      </div>

      <h2>Booking Summary</h2>

      {experience ? (
        <div className="bw-summary__experience">
          <div className="bw-summary__thumb">
            <Image src={experience.imageSrc} alt="" fill sizes="72px" />
          </div>
          <div>
            <strong>{experience.title}</strong>
            <p>{pkg?.name ?? "Select a package"}</p>
            <p className="bw-summary__duration">
              <Clock3 size={14} aria-hidden="true" />
              {experience.durationLabel}
            </p>
          </div>
        </div>
      ) : (
        <p className="bw-muted">Select an experience to begin.</p>
      )}

      <dl className="bw-summary__facts">
        <div>
          <dt>
            <Users size={15} aria-hidden="true" />
            Guests
          </dt>
          <dd>{state.eventDetails.guestCount ?? "—"}</dd>
        </div>
        <div>
          <dt>
            <CalendarDays size={15} aria-hidden="true" />
            Date
          </dt>
          <dd>{state.schedule.date ?? "—"}</dd>
        </div>
        <div>
          <dt>
            <Clock3 size={15} aria-hidden="true" />
            Time
          </dt>
          <dd>{state.schedule.timeLabel ?? "—"}</dd>
        </div>
        <div>
          <dt>
            <MapPin size={15} aria-hidden="true" />
            Location
          </dt>
          <dd>{state.eventDetails.venueName || "—"}</dd>
        </div>
      </dl>

      {state.selectedUpgrades.length > 0 ? (
        <div className="bw-summary__upgrades">
          <h3>Upgrades</h3>
          <ul>
            {state.selectedUpgrades.map((item) => {
              const upgrade = getUpgrade(item.id);
              return (
                <li key={item.id}>
                  {upgrade?.name}
                  {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {pricing ? (
        <div className="bw-summary__totals">
          <div>
            <span>Package Price</span>
            <strong>{formatUsdFromCents(pricing.packagePriceCents)}</strong>
          </div>
          <div>
            <span>Upgrades</span>
            <strong>{formatUsdFromCents(pricing.upgradeTotalCents)}</strong>
          </div>
          <div>
            <span>Service Fee</span>
            <strong>{formatUsdFromCents(pricing.serviceFeeCents)}</strong>
          </div>
          <div className="is-subtotal">
            <span>Subtotal</span>
            <strong>{formatUsdFromCents(pricing.subtotalCents)}</strong>
          </div>
        </div>
      ) : null}

      <div className="bw-payment-choice" role="group" aria-label="Payment option">
        <button
          type="button"
          className={cn(state.paymentOption === "deposit" && "is-active")}
          onClick={() => dispatch({ type: "SET_PAYMENT_OPTION", paymentOption: "deposit" })}
        >
          Pay Deposit
        </button>
        <button
          type="button"
          className={cn(state.paymentOption === "full" && "is-active")}
          onClick={() => dispatch({ type: "SET_PAYMENT_OPTION", paymentOption: "full" })}
        >
          Pay in Full
        </button>
      </div>

      {pricing ? (
        <div className="bw-summary__due">
          <p>
            <span>Due Today</span>
            <strong>{formatUsdFromCents(pricing.amountDueTodayCents)}</strong>
          </p>
          {pricing.remainingBalanceCents > 0 ? (
            <p>
              <span>Remaining Balance</span>
              <strong>{formatUsdFromCents(pricing.remainingBalanceCents)}</strong>
            </p>
          ) : null}
          {pricing.remainingBalanceDueAt ? (
            <small>
              Remaining balance due{" "}
              {new Date(pricing.remainingBalanceDueAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </small>
          ) : null}
        </div>
      ) : null}

      <p className="bw-secure-note bw-summary__secure">
        <Lock size={14} aria-hidden="true" /> Secure and encrypted checkout
      </p>

      <div className="bw-summary__brand">
        <span>HOUSE OF DENISE</span>
      </div>
    </aside>
  );
}

export function PaymentStep() {
  const { state, dispatch, pricing, pricingError, prevStep, clearDraft } = useBookingWizard();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTerms, setSubmittedTerms] = useState(false);

  const idempotencyKey = useMemo(() => {
    if (typeof window === "undefined") return crypto.randomUUID();
    const existing = window.sessionStorage.getItem("hod-booking-checkout-idempotency");
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem("hod-booking-checkout-idempotency", next);
    return next;
  }, []);

  async function startCheckout() {
    setSubmittedTerms(true);
    setError(null);
    if (!state.termsAccepted) {
      setError("Please accept the terms and cancellation policy.");
      return;
    }
    if (!pricing || pricing.requiresManualApproval) {
      setError("This selection requires a custom consultation before payment.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/booking/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          idempotencyKey
        })
      });
      const payload = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || "Checkout could not be started.");
      }
      clearDraft();
      window.sessionStorage.removeItem("hod-booking-checkout-idempotency");
      window.location.href = payload.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not be started.");
      setSubmitting(false);
    }
  }

  return (
    <section className="bw-panel" aria-labelledby="payment-title">
      <header className="bw-panel__header">
        <p className="lux-eyebrow">STEP 6</p>
        <h2 id="payment-title">Payment</h2>
        <p>Secure checkout is powered by Square. Totals are recalculated on the server.</p>
      </header>

      {pricingError ? <p className="bw-error">{pricingError}</p> : null}

      <label className="bw-terms">
        <input
          type="checkbox"
          checked={state.termsAccepted}
          onChange={(e) => dispatch({ type: "SET_TERMS", accepted: e.target.checked })}
        />
        <span>
          I agree to the House of Denise terms, cancellation policy, and understand that deposit
          bookings may require final confirmation after review.
        </span>
      </label>
      {submittedTerms && !state.termsAccepted ? (
        <p className="bw-error">Please accept the terms to continue.</p>
      ) : null}

      {error ? <p className="bw-error" role="alert">{error}</p> : null}

      <div className="bw-step-actions">
        <Button variant="outline" onClick={prevStep} disabled={submitting}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={startCheckout}
          loading={submitting}
          leftIcon={<Lock size={16} aria-hidden="true" />}
        >
          Continue to Secure Checkout
        </Button>
      </div>

      <p className="bw-secure-note">
        <ShieldCheck size={16} aria-hidden="true" /> Your booking is secure and encrypted.
      </p>
    </section>
  );
}

export function BookingSummaryDrawer({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="bw-drawer">
      <button type="button" className="bw-drawer__backdrop" aria-label="Close summary" onClick={onClose} />
      <div className="bw-drawer__panel" role="dialog" aria-modal="true" aria-label="Booking summary">
        <div className="bw-drawer__top">
          <h2>Booking Summary</h2>
          <button type="button" className="lux-header__icon" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <BookingSummary />
      </div>
    </div>
  );
}
