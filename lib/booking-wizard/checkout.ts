import "server-only";
import { randomUUID } from "node:crypto";
import { getExperience, getPackage } from "@/data/booking-catalog";
import { createPendingBookingFromWizard } from "@/lib/booking-wizard/create-pending-booking";
import type { BookingWizardState } from "@/lib/booking-wizard/types";
import { getSquareClient } from "@/lib/square/client";
import { getSquareConfig } from "@/lib/square/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type BookingCheckoutRequest = {
  state: BookingWizardState;
  customerId?: string | null;
  idempotencyKey: string;
};

export async function createBookingSquareCheckout(input: BookingCheckoutRequest) {
  const pending = await createPendingBookingFromWizard(input);
  const experience = getExperience(input.state.selectedExperienceId);
  const pkg = getPackage(input.state.selectedPackageId);
  if (!experience || !pkg) {
    throw new Error("Invalid booking selection.");
  }

  const config = getSquareConfig();
  const square = getSquareClient();
  const amount = pending.amountDueTodayCents;
  const paymentLabel =
    input.state.paymentOption === "full"
      ? `${experience.title} — ${pkg.name} (Paid in Full)`
      : `${experience.title} — ${pkg.name} (Deposit)`;

  const response = await square.checkout.paymentLinks.create({
    idempotencyKey: input.idempotencyKey,
    description: `House of Denise booking ${pending.referenceNumber}`,
    order: {
      locationId: config.locationId,
      referenceId: pending.referenceNumber,
      lineItems: [
        {
          name: paymentLabel,
          quantity: "1",
          note: `Guests: ${input.state.eventDetails.guestCount ?? "n/a"} · ${input.state.schedule.date} ${input.state.schedule.timeLabel ?? ""}`.trim(),
          basePriceMoney: {
            amount: BigInt(amount),
            currency: "USD"
          }
        }
      ]
    },
    checkoutOptions: {
      redirectUrl: `${config.siteUrl}/booking/confirmation?reference=${encodeURIComponent(pending.referenceNumber)}`,
      askForShippingAddress: false
    },
    prePopulatedData: {
      buyerEmail: input.state.customer.email,
      buyerPhoneNumber: input.state.customer.phone || undefined
    },
    paymentNote: `House of Denise booking ${pending.referenceNumber}`
  });

  const paymentLink = response.paymentLink;
  const checkoutUrl = paymentLink?.longUrl ?? paymentLink?.url;
  if (!paymentLink?.id || !checkoutUrl) {
    throw new Error("Square did not return a usable checkout link.");
  }

  const admin = getSupabaseAdminClient();
  if (admin) {
    await admin
      .from("bookings")
      .update({
        square_checkout_id: paymentLink.id,
        square_payment_link_url: checkoutUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", pending.bookingId);
  }

  return {
    checkoutUrl,
    reference: pending.referenceNumber,
    bookingId: pending.bookingId,
    amountDueTodayCents: amount
  };
}

export function createCheckoutIdempotencyKey(seed?: string): string {
  return seed?.trim() || randomUUID();
}
