import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  BOOKING_ADMIN_WRITABLE_STATUSES,
  bookingDbStatusLabel,
  bookingStatusLabel,
  bookingStatusTone,
  isBookingAdminWritableStatus,
  paymentStatusLabel,
  paymentStatusTone
} from "@/lib/admin/booking-status";
import {
  formatDateTime,
  formatUsdFromCents,
  humanizeSlug
} from "@/lib/admin/dashboard-utils";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addBookingNoteAction, updateBookingStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Booking Detail",
  description: "Admin booking detail.",
  path: "/admin/bookings"
});

export default async function AdminBookingDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const admin = getSupabaseAdminClient();
  if (!admin) notFound();

  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  const [{ data: upgrades }, { data: history }, { data: notes }] = await Promise.all([
    admin.from("booking_upgrades").select("*").eq("booking_id", booking.id),
    admin
      .from("booking_status_history")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false }),
    admin
      .from("admin_notes")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false })
  ]);

  const actorEmail = authData.user?.email ?? "admin";

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Booking</p>
          <h1>{booking.reference_number}</h1>
          <p>
            {booking.guest_name} · {booking.guest_email} · {booking.guest_phone}
          </p>
        </div>
        <Link href="/admin/bookings" className="lp-btn">
          Back to bookings
        </Link>
      </header>

      <div className="lp-detail-grid">
        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Booking details</h2>
            <StatusBadge
              label={bookingStatusLabel(booking.status, booking.payment_status)}
              tone={bookingStatusTone(booking.status)}
            />
          </header>
          <dl className="lp-dl">
            <div>
              <dt>Customer</dt>
              <dd>
                {booking.guest_name}
                <br />
                {booking.guest_email}
                <br />
                {booking.guest_phone}
              </dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>{humanizeSlug(booking.experience_slug)}</dd>
            </div>
            <div>
              <dt>Package</dt>
              <dd>{humanizeSlug(booking.package_slug)}</dd>
            </div>
            <div>
              <dt>Date & time</dt>
              <dd>
                {booking.start_at
                  ? `${formatDateTime(booking.start_at)}${
                      booking.end_at ? ` – ${formatDateTime(booking.end_at)}` : ""
                    }`
                  : "Unscheduled"}
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>
                {booking.venue_name || "—"}
                <br />
                {booking.event_address || "—"}
              </dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{booking.guest_count ?? "—"}</dd>
            </div>
            <div>
              <dt>Customer notes</dt>
              <dd>
                {booking.special_requests || booking.customer_notes || "—"}
                {booking.accessibility_needs ? (
                  <>
                    <br />
                    Accessibility: {booking.accessibility_needs}
                  </>
                ) : null}
                {booking.additional_notes ? (
                  <>
                    <br />
                    Additional: {booking.additional_notes}
                  </>
                ) : null}
              </dd>
            </div>
          </dl>
        </section>

        <div className="lp-stack">
          <section className="lp-panel">
            <header className="lp-panel__header">
              <h2>Price breakdown</h2>
            </header>
            <dl className="lp-dl">
              <div>
                <dt>Package</dt>
                <dd>{formatUsdFromCents(booking.package_price_cents)}</dd>
              </div>
              <div>
                <dt>Upgrades</dt>
                <dd>{formatUsdFromCents(booking.upgrade_total_cents)}</dd>
              </div>
              <div>
                <dt>Service fee</dt>
                <dd>{formatUsdFromCents(booking.service_fee_cents)}</dd>
              </div>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatUsdFromCents(booking.subtotal_cents)}</dd>
              </div>
              <div>
                <dt>Deposit</dt>
                <dd>{formatUsdFromCents(booking.deposit_amount_cents)}</dd>
              </div>
              <div>
                <dt>Amount paid</dt>
                <dd>{formatUsdFromCents(booking.amount_paid_cents)}</dd>
              </div>
              <div>
                <dt>Remaining</dt>
                <dd>{formatUsdFromCents(booking.remaining_balance_cents)}</dd>
              </div>
              <div>
                <dt>Payment status</dt>
                <dd>
                  <StatusBadge
                    label={paymentStatusLabel(booking.payment_status)}
                    tone={paymentStatusTone(booking.payment_status)}
                  />
                </dd>
              </div>
              <div>
                <dt>Square</dt>
                <dd>
                  {booking.square_payment_id ||
                    booking.square_checkout_id ||
                    "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="lp-panel">
            <header className="lp-panel__header">
              <h2>Update status</h2>
            </header>
            <form action={updateBookingStatusAction} className="lp-form">
              <input type="hidden" name="bookingId" value={booking.id} />
              <label>
                Booking status
                <select
                  name="status"
                  defaultValue={
                    isBookingAdminWritableStatus(booking.status)
                      ? booking.status
                      : "pending_review"
                  }
                >
                  {BOOKING_ADMIN_WRITABLE_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {bookingDbStatusLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Reason (optional)
                <input name="reason" placeholder="Internal note for this change" />
              </label>
              <button type="submit" className="lp-btn lp-btn--primary">
                Save status
              </button>
              <p className="lp-muted">
                Signed in as {actorEmail}. Changes are written server-side and
                recorded in status history.
              </p>
            </form>
          </section>
        </div>
      </div>

      <section className="lp-panel">
        <header className="lp-panel__header">
          <h2>Upgrades</h2>
        </header>
        {!upgrades?.length ? (
          <p className="lp-empty">No upgrades selected.</p>
        ) : (
          <ul className="lp-activity">
            {upgrades.map((upgrade) => (
              <li key={upgrade.id}>
                <div className="lp-activity__main">
                  <span className="lp-activity__title">{upgrade.name}</span>
                  <span className="lp-activity__subtitle">
                    Qty {upgrade.quantity}
                    {upgrade.quoted_separately ? " · quoted separately" : ""}
                  </span>
                </div>
                <span>
                  {upgrade.quoted_separately
                    ? "Quote"
                    : formatUsdFromCents(upgrade.line_total_cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="lp-grid-2">
        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Activity timeline</h2>
          </header>
          {!history?.length ? (
            <p className="lp-empty">No status history yet.</p>
          ) : (
            <ul className="lp-activity">
              {history.map((item) => (
                <li key={item.id}>
                  <div className="lp-activity__main">
                    <span className="lp-activity__title">
                      {item.old_status ?? "—"} → {item.new_status}
                    </span>
                    <span className="lp-activity__subtitle">
                      {item.reason || "Status change"}
                    </span>
                  </div>
                  <span>{formatDateTime(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Internal notes</h2>
          </header>
          <form action={addBookingNoteAction} className="lp-form" style={{ marginBottom: "1rem" }}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <label>
              Add note
              <textarea name="body" rows={3} required placeholder="Internal note for the team" />
            </label>
            <button type="submit" className="lp-btn lp-btn--gold">
              Save note
            </button>
          </form>
          {!notes?.length ? (
            <p className="lp-empty">No admin notes yet.</p>
          ) : (
            <ul className="lp-activity">
              {notes.map((note) => (
                <li key={note.id}>
                  <div className="lp-activity__main">
                    <span className="lp-activity__title">{note.body}</span>
                  </div>
                  <span>{formatDateTime(note.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
