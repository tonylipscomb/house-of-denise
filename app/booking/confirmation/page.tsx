import Link from "next/link";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatUsdFromCents } from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Booking Confirmation",
  description: "Your House of Denise experience booking confirmation.",
  path: "/booking/confirmation"
});

export default async function BookingConfirmationPage({
  searchParams
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference?.trim();
  if (!reference) notFound();

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return (
      <section className="bw-confirmation">
        <div className="lux-container">
          <h1>We’re confirming your booking</h1>
          <p>Please contact House of Denise with your reference: {reference}</p>
        </div>
      </section>
    );
  }

  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("reference_number", reference)
    .maybeSingle();

  if (!booking) notFound();

  return (
    <section className="bw-confirmation">
      <div className="lux-container bw-confirmation__inner">
        <p className="lux-eyebrow">BOOKING RECEIVED</p>
        <h1>Thank you — your experience is on its way.</h1>
        <p>
          Reference <strong>{booking.reference_number}</strong>. A member of House of Denise will
          follow up with next steps. Payment confirmation may take a few moments to finalize.
        </p>

        <dl className="bw-confirmation__facts">
          <div>
            <dt>Experience</dt>
            <dd>{booking.experience_slug?.replaceAll("-", " ")}</dd>
          </div>
          <div>
            <dt>Package</dt>
            <dd>{booking.package_slug}</dd>
          </div>
          <div>
            <dt>When</dt>
            <dd>
              {booking.start_at
                ? new Date(booking.start_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })
                : "Scheduling pending"}
            </dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{booking.venue_name || "—"}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>{booking.guest_count ?? "—"}</dd>
          </div>
          <div>
            <dt>Amount due at checkout</dt>
            <dd>
              {formatUsdFromCents(
                booking.payment_option === "full"
                  ? booking.subtotal_cents
                  : booking.deposit_amount_cents
              )}
            </dd>
          </div>
          <div>
            <dt>Remaining balance</dt>
            <dd>{formatUsdFromCents(booking.remaining_balance_cents ?? 0)}</dd>
          </div>
        </dl>

        <div className="bw-confirmation__actions">
          <Button href="/account/bookings" variant="primary">
            View my booking
          </Button>
          <Button href="/" variant="outline">
            Return home
          </Button>
          <Link href="/contact" className="bw-inline-link">
            Contact House of Denise
          </Link>
        </div>
      </div>
    </section>
  );
}
