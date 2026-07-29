import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  bookingStatusLabel,
  bookingStatusTone,
  paymentStatusLabel,
  paymentStatusTone
} from "@/lib/admin/booking-status";
import { getCustomerProfile } from "@/lib/admin/customers";
import {
  formatDateTime,
  formatShortDate,
  formatUsdFromCents,
  humanizeSlug
} from "@/lib/admin/dashboard-utils";
import { inquiryStatusLabel, inquiryStatusTone } from "@/lib/admin/inquiry-status";
import { createPageMetadata } from "@/lib/metadata";
import { addCustomerNoteAction } from "../../phase2-actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Customer Profile",
  description: "House of Denise customer profile.",
  path: "/admin/customers"
});

export default async function AdminCustomerDetailPage({
  params
}: {
  params: Promise<{ email: string }>;
}) {
  const { email: encoded } = await params;
  const email = decodeURIComponent(encoded);
  const profile = await getCustomerProfile(email);
  if (!profile) notFound();

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Customer</p>
          <h1>{profile.name}</h1>
          <p>
            {profile.email}
            {profile.phone ? ` · ${profile.phone}` : ""}
          </p>
        </div>
        <Link href="/admin/customers" className="lp-btn">
          Back to customers
        </Link>
      </header>

      <div className="lp-kpi-grid lp-kpi-grid--3">
        <article className="lp-kpi">
          <span className="lp-kpi__label">Total bookings</span>
          <strong className="lp-kpi__value">{profile.bookingCount}</strong>
        </article>
        <article className="lp-kpi lp-kpi--gold">
          <span className="lp-kpi__label">Total spend</span>
          <strong className="lp-kpi__value">
            {formatUsdFromCents(profile.spendCents)}
          </strong>
        </article>
        <article className="lp-kpi">
          <span className="lp-kpi__label">Upcoming / past</span>
          <strong className="lp-kpi__value">
            {profile.upcomingCount} / {profile.pastCount}
          </strong>
        </article>
      </div>

      <div className="lp-detail-grid">
        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Bookings</h2>
          </header>
          {!profile.bookings.length ? (
            <p className="lp-empty">No bookings yet.</p>
          ) : (
            <ul className="lp-activity">
              {profile.bookings.map((booking) => (
                <li key={booking.id}>
                  <div className="lp-activity__main">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="lp-activity__title"
                    >
                      {booking.referenceNumber}
                    </Link>
                    <span className="lp-activity__subtitle">
                      {humanizeSlug(booking.experience)} ·{" "}
                      {formatDateTime(booking.startAt)}
                    </span>
                  </div>
                  <div className="lp-activity__meta">
                    <StatusBadge
                      label={bookingStatusLabel(booking.status, booking.paymentStatus)}
                      tone={bookingStatusTone(booking.status)}
                    />
                    <span>{formatUsdFromCents(booking.totalCents)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Inquiry history</h2>
          </header>
          {!profile.inquiries.length ? (
            <p className="lp-empty">No inquiries yet.</p>
          ) : (
            <ul className="lp-activity">
              {profile.inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <div className="lp-activity__main">
                    <Link
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="lp-activity__title"
                    >
                      {inquiry.referenceNumber}
                    </Link>
                    <span className="lp-activity__subtitle">
                      {inquiry.eventType} · {formatShortDate(inquiry.eventDate)}
                    </span>
                  </div>
                  <StatusBadge
                    label={inquiryStatusLabel(inquiry.status)}
                    tone={inquiryStatusTone(inquiry.status)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="lp-grid-2">
        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Payment history</h2>
          </header>
          {!profile.payments.length ? (
            <p className="lp-empty">No payment records yet.</p>
          ) : (
            <ul className="lp-activity">
              {profile.payments.map((payment) => (
                <li key={payment.id}>
                  <div className="lp-activity__main">
                    <Link href={payment.href} className="lp-activity__title">
                      {payment.reference}
                    </Link>
                    <span className="lp-activity__subtitle">
                      {formatDateTime(payment.date)}
                    </span>
                  </div>
                  <div className="lp-activity__meta">
                    <StatusBadge
                      label={paymentStatusLabel(payment.status)}
                      tone={paymentStatusTone(payment.status)}
                    />
                    <span>{formatUsdFromCents(payment.amountCents)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Internal notes</h2>
          </header>
          <form action={addCustomerNoteAction} className="lp-form">
            <input type="hidden" name="email" value={profile.email} />
            <label>
              Add note
              <textarea name="body" rows={4} required placeholder="Private CRM note" />
            </label>
            <button type="submit" className="lp-btn lp-btn--primary">
              Save note
            </button>
          </form>
          {!profile.notes.length ? (
            <p className="lp-empty" style={{ marginTop: "1rem" }}>
              No notes yet.
            </p>
          ) : (
            <ul className="lp-activity" style={{ marginTop: "1rem" }}>
              {profile.notes.map((note) => (
                <li key={note.id}>
                  <div className="lp-activity__main">
                    <span className="lp-activity__title">{note.body}</span>
                  </div>
                  <span>{formatDateTime(note.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
