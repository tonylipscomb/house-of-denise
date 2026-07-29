import "server-only";
import { randomUUID } from "node:crypto";
import { buildStartEndIso, getSlotsForDate } from "@/lib/booking-wizard/availability";
import { calculateBookingPricingResolved } from "@/lib/booking-wizard/pricing-resolved";
import {
  catalogGetExperience,
  catalogGetPackage,
  catalogGetUpgrade,
  getResolvedBookingCatalog
} from "@/lib/booking-wizard/resolved-catalog";
import type { BookingWizardState } from "@/lib/booking-wizard/types";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { requireSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  classifySupabaseClientError,
  SupabaseConfigError
} from "@/lib/supabase/env";

export type CreatePendingBookingInput = {
  state: BookingWizardState;
  customerId?: string | null;
  idempotencyKey: string;
};

export type PendingBookingResult = {
  bookingId: string;
  referenceNumber: string;
  amountDueTodayCents: number;
  pricing: Awaited<ReturnType<typeof calculateBookingPricingResolved>>;
  alreadyExisted: boolean;
};

function generateBookingReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `HOD-BKG-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function createPendingBookingFromWizard(
  input: CreatePendingBookingInput
): Promise<PendingBookingResult> {
  let admin;
  try {
    admin = requireSupabaseAdminClient();
  } catch (error) {
    if (error instanceof SupabaseConfigError) throw error;
    throw new SupabaseConfigError(
      "missing_service_role_key",
      "Booking storage is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { state, customerId, idempotencyKey } = input;
  const catalog = await getResolvedBookingCatalog();

  const { data: existing, error: existingError } = await admin
    .from("bookings")
    .select("id, reference_number, subtotal_cents, deposit_amount_cents, payment_option, remaining_balance_due_at")
    .eq("checkout_idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingError) {
    throw classifySupabaseClientError(existingError.message);
  }

  if (existing) {
    const pricing = await calculateBookingPricingResolved(
      {
        experienceId: state.selectedExperienceId,
        packageId: state.selectedPackageId,
        selectedUpgrades: state.selectedUpgrades,
        paymentOption: state.paymentOption,
        eventDateIso: state.schedule.date
      },
      catalog
    );
    return {
      bookingId: existing.id,
      referenceNumber: existing.reference_number,
      amountDueTodayCents: pricing.amountDueTodayCents,
      pricing,
      alreadyExisted: true
    };
  }

  const experience = catalogGetExperience(catalog, state.selectedExperienceId);
  const pkg = catalogGetPackage(catalog, state.selectedPackageId);
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

  // Honor admin calendar blocks (skip check if Phase 2 tables are not migrated yet)
  const { data: blocks, error: blocksError } = await admin
    .from("calendar_blocks")
    .select("id, all_day, block_date, start_at, end_at")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID);

  if (!blocksError) {
    const blocked = (blocks ?? []).some((block) => {
      if (block.all_day && block.block_date) {
        return block.block_date === state.schedule.date;
      }
      if (block.start_at && block.end_at) {
        return block.start_at < window.endAt && block.end_at > window.startAt;
      }
      return false;
    });

    if (blocked) {
      throw new Error("That date is unavailable. Please choose another date.");
    }
  }

  const pricing = await calculateBookingPricingResolved(
    {
      experienceId: experience.id,
      packageId: pkg.id,
      selectedUpgrades: state.selectedUpgrades,
      paymentOption: state.paymentOption,
      eventDateIso: state.schedule.date
    },
    catalog
  );

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
    throw classifySupabaseClientError(bookingError.message);
  }

  if (state.selectedUpgrades.length > 0) {
    const rows = state.selectedUpgrades.map((selected) => {
      const upgrade = catalogGetUpgrade(catalog, selected.id)!;
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
      throw classifySupabaseClientError(upgradeError.message);
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
