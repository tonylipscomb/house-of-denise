import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reconcileBookingStripeSession } from "@/lib/booking-wizard/payment-sync";
import {
  BookingConfirmationView,
  type ConfirmationBooking
} from "@/components/booking/BookingConfirmationView";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Booking Confirmation",
  description: "Your House of Denise experience booking confirmation.",
  path: "/booking/confirmation"
});

function toConfirmationBooking(row: Record<string, unknown>): ConfirmationBooking {
  return {
    reference_number: String(row.reference_number ?? ""),
    experience_slug: (row.experience_slug as string | null) ?? null,
    package_slug: (row.package_slug as string | null) ?? null,
    start_at: (row.start_at as string | null) ?? null,
    venue_name: (row.venue_name as string | null) ?? null,
    guest_count: (row.guest_count as number | null) ?? null,
    status: String(row.status ?? "pending_payment"),
    payment_status: String(row.payment_status ?? "pending"),
    payment_option: (row.payment_option as string | null) ?? null,
    deposit_amount_cents: (row.deposit_amount_cents as number | null) ?? null,
    remaining_balance_cents:
      (row.remaining_balance_cents as number | null) ?? null,
    subtotal_cents: (row.subtotal_cents as number | null) ?? null,
    amount_paid_cents: (row.amount_paid_cents as number | null) ?? null,
    stripe_checkout_url: (row.stripe_checkout_url as string | null) ?? null,
    guest_email: (row.guest_email as string | null) ?? null
  };
}

export default async function BookingConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{
    reference?: string;
    session_id?: string;
    invite?: string;
  }>;
}) {
  const params = await searchParams;
  const reference = params.reference?.trim();
  const sessionId = params.session_id?.trim();
  if (!reference) notFound();

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return (
      <section className="bw-confirm">
        <div className="lux-container bw-confirm__shell">
          <h1>We{"\u2019"}re confirming your booking</h1>
          <p>Please contact House of Denise with your reference: {reference}</p>
        </div>
      </section>
    );
  }

  let { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("reference_number", reference)
    .maybeSingle();

  if (!booking) notFound();

  if (sessionId) {
    try {
      const reconciled = await reconcileBookingStripeSession(sessionId, reference);
      if (reconciled) booking = reconciled;
    } catch (error) {
      console.error("Booking confirmation reconcile skipped", {
        message: error instanceof Error ? error.message : "unknown"
      });
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const guestEmail = (booking.guest_email ?? "").trim().toLowerCase();
  const ownsBooking = Boolean(
    user &&
      (booking.customer_id === user.id ||
        (user.email && user.email.trim().toLowerCase() === guestEmail))
  );

  return (
    <BookingConfirmationView
      booking={toConfirmationBooking(booking)}
      ownsBooking={ownsBooking}
      inviteStatus={params.invite}
    />
  );
}
