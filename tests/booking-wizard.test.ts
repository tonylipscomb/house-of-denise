import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateBookingPricing, PricingError } from "../lib/booking-wizard/pricing.ts";
import {
  bookingWizardReducer,
  canNavigateToStep,
  createEmptyWizardState
} from "../lib/booking-wizard/types.ts";

describe("booking wizard pricing", () => {
  it("calculates package, upgrades, service fee, and deposit", () => {
    const pricing = calculateBookingPricing({
      experienceId: "mobile-fragrance-bar",
      packageId: "signature",
      selectedUpgrades: [
        { id: "custom-signage", quantity: 1 },
        { id: "extended-event-time", quantity: 2 }
      ],
      paymentOption: "deposit",
      eventDateIso: "2026-09-17"
    });

    assert.equal(pricing.packagePriceCents, 125000);
    assert.equal(pricing.upgradeTotalCents, 8500 + 20000 * 2);
    assert.equal(pricing.serviceFeeCents, 12500);
    assert.equal(pricing.subtotalCents, 125000 + 48500 + 12500);
    assert.equal(pricing.depositAmountCents, Math.round(pricing.subtotalCents * 0.3));
    assert.equal(pricing.amountDueTodayCents, pricing.depositAmountCents);
    assert.equal(pricing.remainingBalanceCents, pricing.subtotalCents - pricing.depositAmountCents);
    assert.ok(pricing.remainingBalanceDueAt);
  });

  it("charges full amount when pay in full is selected", () => {
    const pricing = calculateBookingPricing({
      experienceId: "perfume-bar-experience",
      packageId: "essential",
      selectedUpgrades: [],
      paymentOption: "full",
      eventDateIso: "2026-10-01"
    });
    assert.equal(pricing.amountDueTodayCents, pricing.subtotalCents);
    assert.equal(pricing.remainingBalanceCents, 0);
  });

  it("rejects unavailable upgrades", () => {
    assert.throws(
      () =>
        calculateBookingPricing({
          experienceId: "luxury-workshops",
          packageId: "essential",
          selectedUpgrades: [{ id: "extra-fragrance-station", quantity: 1 }],
          paymentOption: "deposit",
          eventDateIso: null
        }),
      PricingError
    );
  });

  it("marks custom packages as requiring approval", () => {
    const pricing = calculateBookingPricing({
      experienceId: "private-events",
      packageId: "custom",
      selectedUpgrades: [],
      paymentOption: "deposit",
      eventDateIso: null
    });
    assert.equal(pricing.requiresManualApproval, true);
    assert.equal(pricing.amountDueTodayCents, 0);
  });
});

describe("booking wizard navigation", () => {
  it("persists experience selection and blocks forward jumps", () => {
    let state = createEmptyWizardState();
    assert.equal(canNavigateToStep(state, 1), false);

    state = bookingWizardReducer(state, {
      type: "SELECT_EXPERIENCE",
      experienceId: "mobile-fragrance-bar"
    });
    assert.equal(state.currentStep, 1);
    assert.equal(canNavigateToStep(state, 1), true);
    assert.equal(canNavigateToStep(state, 2), false);
  });
});
