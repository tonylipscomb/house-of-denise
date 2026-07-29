import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin/auth";
import {
  formatDateTime,
  formatShortDate,
  humanizeSlug
} from "@/lib/admin/dashboard-utils";
import { getAdminInquiry } from "@/lib/admin/inquiries";
import {
  INQUIRY_WORKFLOW_STATUSES,
  inquiryStatusLabel,
  inquiryStatusTone
} from "@/lib/admin/inquiry-status";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateInquiryStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Inquiry Detail",
  description: "Admin inquiry detail.",
  path: "/admin/inquiries"
});

export default async function AdminInquiryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const inquiry = await getAdminInquiry(id);
  if (!inquiry) notFound();

  const admin = getSupabaseAdminClient();
  const { data: notes } = admin
    ? await admin
        .from("admin_notes")
        .select("*")
        .eq("booking_inquiry_id", inquiry.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Prefer writable workflow statuses; keep legacy value selectable if present
  const statusOptions = Array.from(
    new Set([
      ...INQUIRY_WORKFLOW_STATUSES,
      inquiry.inquiry_status,
      "reviewing",
      "followed-up"
    ])
  );

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Inquiry</p>
          <h1>{inquiry.reference_number}</h1>
          <p>
            Submitted {formatDateTime(inquiry.created_at)} ·{" "}
            {inquiry.full_name}
          </p>
        </div>
        <Link href="/admin/inquiries" className="lp-btn">
          Back to inquiries
        </Link>
      </header>

      <div className="lp-detail-grid">
        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Inquiry details</h2>
            <StatusBadge
              label={inquiryStatusLabel(
                inquiry.inquiry_status,
                inquiry.converted_booking_id
              )}
              tone={inquiryStatusTone(
                inquiry.inquiry_status,
                inquiry.converted_booking_id
              )}
            />
          </header>
          <dl className="lp-dl">
            <div>
              <dt>Customer</dt>
              <dd>
                {inquiry.full_name}
                <br />
                {inquiry.email}
                <br />
                {inquiry.phone}
                <br />
                Preferred: {inquiry.preferred_contact_method || "—"}
              </dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>
                {inquiry.event_type}
                <br />
                {formatShortDate(inquiry.event_date)}
                {inquiry.event_start_time ? ` · ${inquiry.event_start_time}` : ""}
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>
                {inquiry.venue_name || "—"}
                <br />
                {[inquiry.event_city, inquiry.event_state, inquiry.event_zip]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>{humanizeSlug(inquiry.experience_format)}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{inquiry.estimated_guest_count}</dd>
            </div>
            <div>
              <dt>Description</dt>
              <dd>{inquiry.event_description || "—"}</dd>
            </div>
            <div>
              <dt>Special requests</dt>
              <dd>{inquiry.special_requests || "—"}</dd>
            </div>
            <div>
              <dt>Referral</dt>
              <dd>{inquiry.referral_source || "—"}</dd>
            </div>
            <div>
              <dt>Duplicate fingerprint</dt>
              <dd>
                <code className="lp-code">
                  {inquiry.submission_fingerprint || "—"}
                </code>
              </dd>
            </div>
            <div>
              <dt>Email delivery</dt>
              <dd>
                Owner: {inquiry.owner_email_status} · Customer:{" "}
                {inquiry.customer_email_status}
              </dd>
            </div>
            <div>
              <dt>Converted booking</dt>
              <dd>
                {inquiry.converted_booking_id ? (
                  <Link
                    href={`/admin/bookings/${inquiry.converted_booking_id}`}
                    className="lp-table__link"
                  >
                    Open booking
                  </Link>
                ) : (
                  "Not converted"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <div className="lp-stack">
          <section className="lp-panel">
            <header className="lp-panel__header">
              <h2>Update status</h2>
            </header>
            <form action={updateInquiryStatusAction} className="lp-form">
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <label>
                Inquiry status
                <select name="status" defaultValue={inquiry.inquiry_status}>
                  {statusOptions.map((value) => (
                    <option key={value} value={value}>
                      {value.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Internal note (optional)
                <textarea name="note" rows={4} placeholder="Add a private note" />
              </label>
              <button type="submit" className="lp-btn lp-btn--primary">
                Save inquiry
              </button>
            </form>
          </section>

          <section className="lp-panel">
            <header className="lp-panel__header">
              <h2>Customer</h2>
            </header>
            <p className="lp-muted">
              Open the customers area to review related booking history. Full
              customer profiles expand in Phase 2.
            </p>
            <Link
              href={`/admin/customers?q=${encodeURIComponent(inquiry.email)}`}
              className="lp-btn"
            >
              Open customer search
            </Link>
            {!inquiry.converted_booking_id ? (
              <Link href="/booking" className="lp-btn lp-btn--primary">
                Start booking conversion
              </Link>
            ) : null}
          </section>
        </div>
      </div>

      <section className="lp-panel">
        <header className="lp-panel__header">
          <h2>Internal notes</h2>
        </header>
        {!notes?.length ? (
          <p className="lp-empty">No notes yet.</p>
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
    </>
  );
}
