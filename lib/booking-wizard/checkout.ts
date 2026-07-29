import "server-only";

import { randomUUID } from "node:crypto";
import { createPendingBookingFromWizard } from "@/lib/booking-wizard/create-pending-booking";
import {
  catalogGetExperience,
  catalogGetPackage,
  getResolvedBookingCatalog,
} from "@/lib/booking-wizard/resolved-catalog";
import type { BookingWizardState } from "@/lib/booking-wizard/types";
import { getStripeClient } from "@/lib/stripe/client";
import { getStripeConfig } from "@/lib/stripe/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { classifySupabaseClientError } from "@/lib/supabase/env";

export type BookingCheckoutRequest = {
  state: BookingWizardState;
  customerId?: string | null;
  idempotencyKey: string;
};

export async function createBookingStripeCheckout(
  input: BookingCheckoutRequest,
) {
  const pending = await createPendingBookingFromWizard(input);
  const catalog = await getResolvedBookingCatalog();
  const experience = catalogGetExperience(
    catalog,
    input.state.selectedExperienceId,
  );
  const pkg = catalogGetPackage(catalog, input.state.selectedPackageId);

  if (!experience || !pkg) {
    throw new Error("Invalid booking selection.");
  }

  const stripe = getStripeClient();
  const config = getStripeConfig();
  const amount = pending.amountDueTodayCents;

  const paymentLabel =
    input.state.paymentOption === "full"
      ? `${experience.title} \u2014 ${pkg.name} (Paid in Full)`
      : `${experience.title} \u2014 ${pkg.name} (Deposit)`;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      success_url:
        `${config.siteUrl}/booking/confirmation` +
        `?reference=${encodeURIComponent(pending.referenceNumber)}` +
        "&session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        `${config.siteUrl}/booking` +
        `?checkout=cancelled&reference=${encodeURIComponent(pending.referenceNumber)}`,
      client_reference_id: pending.referenceNumber,
      customer_email: input.state.customer.email,
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: paymentLabel,
              description:
                `${input.state.eventDetails.guestCount ?? "N/A"} guests \u00B7 ` +
                `${input.state.schedule.date ?? ""} ` +
                `${input.state.schedule.timeLabel ?? ""}`.trim(),
              metadata: {
                booking_reference: pending.referenceNumber,
                experience_slug: experience.slug,
                package_id: pkg.id,
              },
            },
          },
        },
      ],
      metadata: {
        payment_kind: "booking",
        booking_id: pending.bookingId,
        booking_reference: pending.referenceNumber,
        payment_option: input.state.paymentOption,
        amount_due_today_cents: String(amount),
      },
      payment_intent_data: {
        metadata: {
          payment_kind: "booking",
          booking_id: pending.bookingId,
          booking_reference: pending.referenceNumber,
          payment_option: input.state.paymentOption,
        },
      },
    },
    {
      idempotencyKey: input.idempotencyKey,
    },
  );

  if (!session.id || !session.url) {
    throw new Error("Stripe did not return a usable checkout session.");
  }

  const admin = getSupabaseAdminClient();

  if (admin) {
    const { error } = await admin
      .from("bookings")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        stripe_checkout_url: session.url,
        payment_provider: "stripe",
        status: "payment_pending",
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pending.bookingId);

    if (error) {
      throw classifySupabaseClientError(error.message);
    }
  }

  return {
    checkoutUrl: session.url,
    reference: pending.referenceNumber,
    bookingId: pending.bookingId,
    amountDueTodayCents: amount,
    provider: "stripe" as const,
  };
}

export function createCheckoutIdempotencyKey(seed?: string): string {
  return seed?.trim() || randomUUID();
}
