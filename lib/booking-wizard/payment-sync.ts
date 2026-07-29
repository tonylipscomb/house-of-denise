import "server-only";

import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function paymentIntentId(
  value: string | Stripe.PaymentIntent | null,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function syncBookingFromStripeSession(
  session: Stripe.Checkout.Session,
) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase admin client is not configured.");
  }

  const bookingId = session.metadata?.booking_id?.trim();

  if (!bookingId) {
    return null;
  }

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    throw new Error(
      `Unable to locate booking for Stripe payment: ${bookingError.message}`,
    );
  }

  if (!booking) return null;

  const amountPaidCents = session.amount_total ?? 0;
  const expectedAmount =
    booking.payment_option === "full"
      ? booking.subtotal_cents
      : booking.deposit_amount_cents;

  if (session.payment_status === "paid" && amountPaidCents < expectedAmount) {
    throw new Error(
      `Stripe payment amount ${amountPaidCents} is less than expected ${expectedAmount}.`,
    );
  }

  const previousStatus = booking.status;
  const previousPaymentStatus = booking.payment_status;

  let nextStatus = booking.status;
  let nextPaymentStatus = booking.payment_status;
  let newAmountPaidCents = booking.amount_paid_cents ?? 0;
  let remainingBalanceCents =
    booking.remaining_balance_cents ?? booking.subtotal_cents;

  if (session.payment_status === "paid") {
    newAmountPaidCents = Math.max(newAmountPaidCents, amountPaidCents);
    remainingBalanceCents = Math.max(
      booking.subtotal_cents - newAmountPaidCents,
      0,
    );
    nextPaymentStatus =
      remainingBalanceCents > 0 ? "deposit_paid" : "paid";
    nextStatus = "pending_review";
  } else if (session.status === "expired") {
    nextPaymentStatus = "failed";
    nextStatus = "pending_payment";
  } else {
    nextPaymentStatus = "pending";
    nextStatus = "payment_pending";
  }

  const { error: updateError } = await admin
    .from("bookings")
    .update({
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId(session.payment_intent),
      payment_provider: "stripe",
      amount_paid_cents: newAmountPaidCents,
      remaining_balance_cents: remainingBalanceCents,
      payment_status: nextPaymentStatus,
      status: nextStatus,
      paid_at:
        session.payment_status === "paid"
          ? new Date().toISOString()
          : booking.paid_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id);

  if (updateError) {
    throw new Error(`Unable to update booking payment: ${updateError.message}`);
  }

  if (
    previousStatus !== nextStatus ||
    previousPaymentStatus !== nextPaymentStatus
  ) {
    await admin.from("booking_status_history").insert({
      workspace_id: booking.workspace_id,
      booking_id: booking.id,
      old_status: previousStatus,
      new_status: nextStatus,
      changed_by: null,
      reason: `Stripe Checkout ${session.payment_status}`,
    });
  }

  const newlyPaid =
    session.payment_status === "paid" &&
    previousPaymentStatus !== "paid" &&
    previousPaymentStatus !== "deposit_paid" &&
    (nextPaymentStatus === "paid" || nextPaymentStatus === "deposit_paid");

  if (newlyPaid && booking.guest_email) {
    const eventDate = booking.start_at
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeZone: booking.timezone || "America/New_York"
        }).format(new Date(booking.start_at))
      : null;

    const emailInput = {
      referenceNumber: booking.reference_number,
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      eventDate,
      amountPaidCents: newAmountPaidCents,
      remainingBalanceCents,
      paymentStatus: nextPaymentStatus
    };

    try {
      const {
        sendCustomerBookingPaymentConfirmation,
        sendOwnerBookingPaymentNotification
      } = await import("@/lib/email/booking-payment-emails");
      await sendCustomerBookingPaymentConfirmation(emailInput);
      await sendOwnerBookingPaymentNotification(emailInput);
    } catch (error) {
      console.warn("[booking-payment] confirmation email failed", {
        referenceNumber: booking.reference_number,
        message: error instanceof Error ? error.message : "unknown"
      });
    }
  }

  return {
    bookingId: booking.id,
    referenceNumber: booking.reference_number,
    status: nextStatus,
    paymentStatus: nextPaymentStatus,
  };
}

export async function reconcileBookingStripeSession(
  sessionId: string,
  reference?: string,
) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (
    session.metadata?.payment_kind !== "booking" ||
    (reference &&
      session.metadata.booking_reference &&
      session.metadata.booking_reference !== reference)
  ) {
    throw new Error("Stripe session does not match this booking.");
  }

  await syncBookingFromStripeSession(session);

  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", session.metadata?.booking_id ?? "")
    .maybeSingle();

  return data ?? null;
}
