import Link from "next/link";
import {
  CalendarDays,
  Check,
  Gift,
  Home,
  Info,
  Lock,
  MapPin,
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  bookingStatusLabel,
  paymentStatusLabel
} from "@/lib/admin/booking-status";
import { formatUsdFromCents } from "@/data/booking-catalog";
import { requestBookingAccessInviteAction } from "@/app/auth/actions";
import { cn } from "@/lib/cn";

export type ConfirmationBooking = {
  reference_number: string;
  experience_slug: string | null;
  package_slug: string | null;
  start_at: string | null;
  venue_name: string | null;
  guest_count: number | null;
  status: string;
  payment_status: string;
  payment_option: string | null;
  deposit_amount_cents: number | null;
  remaining_balance_cents: number | null;
  subtotal_cents: number | null;
  amount_paid_cents: number | null;
  stripe_checkout_url: string | null;
  guest_email: string | null;
};

type ProgressStep = {
  id: string;
  label: string;
  state: "complete" | "current" | "upcoming";
};

function humanizeSlug(value: string | null | undefined) {
  if (!value) return "\u2014";
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatWhen(startAt: string | null) {
  if (!startAt) return "Scheduling pending";
  return new Date(startAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function buildProgress(booking: ConfirmationBooking): ProgressStep[] {
  const paid =
    booking.payment_status === "deposit_paid" ||
    booking.payment_status === "paid";
  const reviewed = ![
    "draft",
    "pending",
    "pending_payment",
    "payment_pending"
  ].includes(booking.status);
  const confirmed =
    booking.status === "confirmed" || booking.status === "completed";

  const steps = [
    { id: "received", label: "Request received", done: true },
    { id: "reviewed", label: "Details reviewed", done: reviewed || paid },
    { id: "deposit", label: "Deposit completed", done: paid },
    { id: "confirmed", label: "Reservation confirmed", done: confirmed }
  ];

  let foundCurrent = false;
  return steps.map((step) => {
    if (step.done) {
      return { id: step.id, label: step.label, state: "complete" as const };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { id: step.id, label: step.label, state: "current" as const };
    }
    return { id: step.id, label: step.label, state: "upcoming" as const };
  });
}

function depositDueLabel(booking: ConfirmationBooking) {
  if (booking.payment_option === "full") return "Amount due";
  return "Deposit due";
}

function payButtonLabel(booking: ConfirmationBooking) {
  if (booking.payment_option === "full") return "Pay Securely";
  return "Pay Deposit Securely";
}

function statusBadgeLabel(booking: ConfirmationBooking) {
  if (
    booking.payment_status === "paid" ||
    booking.payment_status === "deposit_paid"
  ) {
    return bookingStatusLabel(booking.status, booking.payment_status);
  }
  if (booking.payment_option === "full") return "Payment Required";
  return "Deposit Required";
}

export function BookingConfirmationView({
  booking,
  ownsBooking,
  inviteStatus
}: {
  booking: ConfirmationBooking;
  ownsBooking: boolean;
  inviteStatus?: string;
}) {
  const progress = buildProgress(booking);
  const amountDueCents =
    booking.payment_option === "full"
      ? booking.subtotal_cents ?? 0
      : booking.deposit_amount_cents ?? 0;
  const remainingCents = booking.remaining_balance_cents ?? 0;
  const totalCents = booking.subtotal_cents ?? 0;
  const paymentComplete =
    booking.payment_status === "paid" ||
    booking.payment_status === "deposit_paid";
  const checkoutUrl = booking.stripe_checkout_url?.trim() || null;
  const canPay =
    Boolean(checkoutUrl) &&
    !paymentComplete &&
    ["pending", "unpaid", "failed"].includes(booking.payment_status);

  const detailRows = [
    {
      label: "Experience",
      value: humanizeSlug(booking.experience_slug),
      icon: Sparkles
    },
    {
      label: "Package",
      value: humanizeSlug(booking.package_slug),
      icon: Gift
    },
    {
      label: "When",
      value: formatWhen(booking.start_at),
      icon: CalendarDays
    },
    {
      label: "Venue",
      value: booking.venue_name?.trim() || "\u2014",
      icon: MapPin
    },
    {
      label: "Guests",
      value:
        booking.guest_count != null ? String(booking.guest_count) : "\u2014",
      icon: Users
    }
  ] as const;

  return (
    <section className="bw-confirm" aria-labelledby="bw-confirm-title">
      <div className="lux-container bw-confirm__shell">
        <header className="bw-confirm__hero">
          <div className="bw-confirm__medallion" aria-hidden="true">
            <Check size={28} strokeWidth={2.25} />
          </div>
          <p className="lux-eyebrow bw-confirm__eyebrow">Booking received</p>
          <h1 id="bw-confirm-title">
            Thank you {"\u2014"} your experience is on its way.
          </h1>
          <p className="bw-confirm__lead">
            A member of House of Denise will follow up with next steps. Your
            payment status is shown below and may take a few moments to
            finalize.
          </p>
          <p className="bw-confirm__reference">
            <span>Reference</span>
            <span aria-hidden="true">{" \u00B7 "}</span>
            <strong>{booking.reference_number}</strong>
          </p>
        </header>

        <article className="bw-confirm__card">
          <div className="bw-confirm__details">
            <h2>Experience Details</h2>
            <dl className="bw-confirm__rows">
              {detailRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="bw-confirm__row">
                    <dt>
                      <span className="bw-confirm__row-icon" aria-hidden="true">
                        <Icon size={18} strokeWidth={1.6} />
                      </span>
                      <span>{row.label}</span>
                    </dt>
                    <dd>{row.value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="bw-confirm__summary">
            <h2>Reservation Summary</h2>
            <p
              className={cn(
                "bw-confirm__badge",
                paymentComplete && "is-complete"
              )}
            >
              <span aria-hidden="true">{"\u2022"}</span>
              {statusBadgeLabel(booking)}
            </p>
            <p className="visually-hidden">
              Booking status:{" "}
              {bookingStatusLabel(booking.status, booking.payment_status)}.
              Payment status: {paymentStatusLabel(booking.payment_status)}.
            </p>

            <div className="bw-confirm__deposit">
              <span>{depositDueLabel(booking)}</span>
              <strong>{formatUsdFromCents(amountDueCents)}</strong>
            </div>

            <dl className="bw-confirm__money">
              <div>
                <dt>Remaining balance</dt>
                <dd>{formatUsdFromCents(remainingCents)}</dd>
              </div>
              <div>
                <dt>Total experience amount</dt>
                <dd>{formatUsdFromCents(totalCents)}</dd>
              </div>
            </dl>

            <p className="bw-confirm__note">
              <Info size={16} aria-hidden="true" />
              <span>
                Your date will be fully reserved once the deposit is completed.
              </span>
            </p>

            {canPay && checkoutUrl ? (
              <Button
                href={checkoutUrl}
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Lock size={16} aria-hidden="true" />}
              >
                {payButtonLabel(booking)}
              </Button>
            ) : paymentComplete ? (
              <p className="bw-confirm__paid" role="status">
                <Check size={16} aria-hidden="true" />
                <span>
                  {booking.payment_status === "paid"
                    ? "Payment completed"
                    : "Deposit received"}
                </span>
              </p>
            ) : (
              <p className="bw-confirm__note">
                <Info size={16} aria-hidden="true" />
                <span>
                  Secure payment link is preparing. Refresh shortly or contact
                  House of Denise with your reference if needed.
                </span>
              </p>
            )}
          </div>
        </article>

        <ol className="bw-confirm__progress" aria-label="Booking progress">
          {progress.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "bw-confirm__step",
                step.state === "complete" && "is-complete",
                step.state === "current" && "is-current"
              )}
            >
              <span className="bw-confirm__step-marker" aria-hidden="true">
                {step.state === "complete" ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              <span className="bw-confirm__step-label">
                {step.label}
                {step.state === "complete" ? (
                  <span className="visually-hidden"> (complete)</span>
                ) : null}
                {step.state === "current" ? (
                  <span className="visually-hidden"> (current)</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>

        <div className="bw-confirm__footer">
          <div className="bw-confirm__actions">
            {ownsBooking ? (
              <Button
                href={`/account/bookings/${encodeURIComponent(booking.reference_number)}`}
                variant="primary"
                leftIcon={<CalendarDays size={17} aria-hidden="true" />}
              >
                View My Booking
              </Button>
            ) : (
              <form
                action={requestBookingAccessInviteAction}
                className="bw-confirm__invite-inline"
              >
                <input
                  type="hidden"
                  name="email"
                  value={booking.guest_email ?? ""}
                />
                <input
                  type="hidden"
                  name="bookingReference"
                  value={booking.reference_number}
                />
                <Button type="submit" variant="primary">
                  Email me a sign-in link
                </Button>
              </form>
            )}
            <Button
              href="/"
              variant="outline"
              leftIcon={<Home size={17} aria-hidden="true" />}
            >
              Return Home
            </Button>
            <Link href="/contact" className="bw-confirm__text-link">
              Contact House of Denise
            </Link>
            {!ownsBooking && inviteStatus === "sent" ? (
              <p className="bw-confirm__invite-status" role="status">
                Check your inbox for the sign-in link.
              </p>
            ) : null}
            {!ownsBooking && inviteStatus === "rate-limit" ? (
              <p className="bw-confirm__invite-status is-error" role="status">
                Too many email attempts just now. Wait a minute, then try
                again — or create an account with the same email.
              </p>
            ) : null}
            {!ownsBooking && inviteStatus === "error" ? (
              <p className="bw-confirm__invite-status is-error" role="status">
                We couldn{"\u2019"}t send the invite just now. Try again, or
                create an account with the same email.
              </p>
            ) : null}
            {!ownsBooking ? (
              <p className="bw-confirm__invite-hint">
                Save this booking to your account with{" "}
                <strong>{booking.guest_email}</strong>, then open the details
                anytime.
              </p>
            ) : null}
          </div>

          <aside className="bw-confirm__concierge" aria-labelledby="concierge-title">
            <div className="bw-confirm__concierge-icon" aria-hidden="true">
              <Sparkles size={18} strokeWidth={1.6} />
            </div>
            <div>
              <h2 id="concierge-title">Need assistance?</h2>
              <p>
                Our House of Denise experience concierge is available to help
                with guest counts, package details, and special requests.
              </p>
              <Link href="/contact" className="bw-confirm__text-link">
                Contact Our Concierge
                <span aria-hidden="true"> {"\u2192"}</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
