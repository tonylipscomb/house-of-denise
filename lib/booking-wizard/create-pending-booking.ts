import "server-only";
import { randomUUID } from "node:crypto";
import { getExperience, getPackage, getUpgrade } from "@/data/booking-catalog";
import { buildStartEndIso, getSlotsForDate } from "@/lib/booking-wizard/availability";
import { calculateBookingPricing } from "@/lib/booking-wizard/pricing";
import type { BookingWizardState } from "@/lib/booking-wizard/types";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type CreatePendingBookingInput = {
  state: BookingWizardState;
  customerId?: string | null;
  idempotencyKey: string;
};

export type PendingBookingResult = {
  bookingId: string;
  referenceNumber: string;
  amountDueTodayCents: number;
  pricing: ReturnType<typeof calculateBookingPricing>;
  alreadyExisted: boolean;
};

function generateBookingReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `HOD-BKG-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function createPendingBookingFromWizard(
  input: CreatePendingBookingInput
): Promise<PendingBookingResult> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error("Booking storage is not configured.");
  }

  const { state, customerId, idempotencyKey } = input;

  const { data: existing } = await admin
    .from("bookings")
    .select("id, reference_number, subtotal_cents, deposit_amount_cents, payment_option, remaining_balance_due_at")
    .eq("checkout_idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) {
    const pricing = calculateBookingPricing({
      experienceId: state.selectedExperienceId,
      packageId: state.selectedPackageId,
      selectedUpgrades: state.selectedUpgrades,
      paymentOption: state.paymentOption,
      eventDateIso: state.schedule.date
    });
    return {
      bookingId: existing.id,
      referenceNumber: existing.reference_number,
      amountDueTodayCents: pricing.amountDueTodayCents,
      pricing,
      alreadyExisted: true
    };
  }

  const experience = getExperience(state.selectedExperienceId);
  const pkg = getPackage(state.selectedPackageId);
  if (!experience || !pkg) {
    throw new Error("Experience and package are required.");
  }

  if (pkg.priceCents === null || pkg.requiresManualApproval) {
    throw new Error(
      "Custom packages require a consultation before checkout. Please inquire about a custom event."
    );
  }

  if (!state.schedule.date || !state.schedule.timeSlotId) {
    throw new Error("A date and time are required.");
  }

  const slots = await getSlotsForDate(state.schedule.date);
  const slot = slots.find((item) => item.id === state.schedule.timeSlotId);
  if (!slot) {
    throw new Error("The selected time is no longer available.");
  }

  // Overlap guard: reject if another pending/confirmed booking shares the slot window
  const window = buildStartEndIso({
    dateIso: state.schedule.date,
    slot,
    durationMinutes: experience.durationMinutes
  });

  const { data: conflicts } = await admin
    .from("bookings")
    .select("id")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .in("status", ["pending_payment", "payment_pending", "pending_review", "confirmed"])
    .lt("start_at", window.endAt)
    .gt("end_at", window.startAt)
    .limit(1);

  if (conflicts && conflicts.length > 0) {
    throw new Error("That date and time was just reserved. Please choose another time.");
  }

  const pricing = calculateBookingPricing({
    experienceId: experience.id,
    packageId: pkg.id,
    selectedUpgrades: state.selectedUpgrades,
    paymentOption: state.paymentOption,
    eventDateIso: state.schedule.date
  });

  if (pricing.amountDueTodayCents <= 0) {
    throw new Error("Unable to create checkout for this selection.");
  }

  const referenceNumber = generateBookingReference();
  const bookingId = randomUUID();

  const { error: bookingError } = await admin.from("bookings").insert({
    id: bookingId,
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    reference_number: referenceNumber,
    customer_id: customerId ?? null,
    guest_email: state.customer.email,
    guest_name: state.customer.fullName,
    guest_phone: state.customer.phone,
    experience_slug: experience.slug,
    package_slug: pkg.id,
    start_at: window.startAt,
    end_at: window.endAt,
    timezone: window.timezone,
    guest_count: state.eventDetails.guestCount,
    status: "pending_payment",
    payment_status: "pending",
    source: "website",
    venue_name: state.eventDetails.venueName,
    event_address: state.eventDetails.address,
    occasion: state.eventDetails.occasion,
    event_type: state.eventDetails.eventType,
    indoor_outdoor: state.eventDetails.indoorOutdoor,
    special_requests: state.eventDetails.specialRequests,
    accessibility_needs: state.eventDetails.accessibilityNeeds,
    additional_notes: state.eventDetails.additionalNotes,
    preferred_contact_method: state.customer.preferredContactMethod,
    customer_notes: state.eventDetails.additionalNotes,
    package_price_cents: pricing.packagePriceCents,
    upgrade_total_cents: pricing.upgradeTotalCents,
    service_fee_cents: pricing.serviceFeeCents,
    subtotal_cents: pricing.subtotalCents,
    deposit_amount_cents: pricing.depositAmountCents,
    amount_paid_cents: 0,
    remaining_balance_cents: pricing.remainingBalanceCents,
    remaining_balance_due_at: pricing.remainingBalanceDueAt,
    payment_option: state.paymentOption,
    checkout_idempotency_key: idempotencyKey
  });

  if (bookingError) {
    throw new Error(`Unable to create booking: ${bookingError.message}`);
  }

  if (state.selectedUpgrades.length > 0) {
    const rows = state.selectedUpgrades.map((selected) => {
      const upgrade = getUpgrade(selected.id)!;
      const quantity = upgrade.allowQuantity ? selected.quantity : 1;
      const quoted = upgrade.priceCents === null;
      return {
        workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
        booking_id: bookingId,
        upgrade_slug: upgrade.id,
        name: upgrade.name,
        description: upgrade.description,
        unit_price_cents: upgrade.priceCents,
        quantity,
        line_total_cents: quoted || upgrade.priceCents === null ? null : upgrade.priceCents * quantity,
        quoted_separately: quoted
      };
    });

    const { error: upgradeError } = await admin.from("booking_upgrades").insert(rows);
    if (upgradeError) {
      throw new Error(`Unable to save upgrades: ${upgradeError.message}`);
    }
  }

  await admin.from("booking_status_history").insert({
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    booking_id: bookingId,
    old_status: null,
    new_status: "pending_payment",
    changed_by: customerId ?? null,
    reason: "Checkout initiated from booking wizard"
  });

  return {
    bookingId,
    referenceNumber,
    amountDueTodayCents: pricing.amountDueTodayCents,
    pricing,
    alreadyExisted: false
  };
}
