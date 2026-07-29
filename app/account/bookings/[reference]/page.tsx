import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  bookingStatusLabel,
  paymentStatusLabel
} from "@/lib/admin/booking-status";
import { getCustomerBookingByReference } from "@/lib/booking-wizard/claim-bookings";
import { formatUsdFromCents } from "@/data/booking-catalog";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Booking Details",
  description: "Your House Of Denise booking details.",
  path: "/account/bookings"
});

export default async function AccountBookingDetailPage({
  params
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference: encoded } = await params;
  const reference = decodeURIComponent(encoded);
  const context = await requireWorkspaceMembership(
    undefined,
    `/account/bookings/${encodeURIComponent(reference)}`
  );

  const booking = await getCustomerBookingByReference({
    userId: context.userId,
    email: context.email,
    referenceNumber: reference
  });

  if (!booking) notFound();

  return (
    <section className="account-page" aria-labelledby="booking-detail-title">
      <p className="eyebrow">Booking</p>
      <h1 id="booking-detail-title">{booking.reference_number}</h1>
      <p>
        {bookingStatusLabel(booking.status, booking.payment_status)}
        {" \u00B7 "}
        {paymentStatusLabel(booking.payment_status)}
      </p>

      <dl className="bw-confirmation__facts" style={{ marginTop: "1.5rem" }}>
        <div>
          <dt>Experience</dt>
          <dd style={{ textTransform: "capitalize" }}>
            {booking.experience_slug?.replaceAll("-", " ") || "\u2014"}
          </dd>
        </div>
        <div>
          <dt>Package</dt>
          <dd>{booking.package_slug || "\u2014"}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>
            {booking.start_at
              ? new Date(booking.start_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })
              : "Not scheduled"}
          </dd>
        </div>
        <div>
          <dt>Venue</dt>
          <dd>{booking.venue_name || "\u2014"}</dd>
        </div>
        <div>
          <dt>Guests</dt>
          <dd>{booking.guest_count ?? "\u2014"}</dd>
        </div>
        <div>
          <dt>Amount paid</dt>
          <dd>{formatUsdFromCents(booking.amount_paid_cents ?? 0)}</dd>
        </div>
        <div>
          <dt>Remaining balance</dt>
          <dd>{formatUsdFromCents(booking.remaining_balance_cents ?? 0)}</dd>
        </div>
      </dl>

      <div className="bw-confirmation__actions" style={{ marginTop: "1.5rem" }}>
        <Button href="/account/bookings" variant="outline">
          Back to bookings
        </Button>
        <Button href="/contact" variant="primary">
          Contact House of Denise
        </Button>
        <Link href="/booking" className="bw-inline-link">
          Book another experience
        </Link>
      </div>
    </section>
  );
}
