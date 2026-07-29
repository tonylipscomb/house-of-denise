/**
 * Centralized booking status definitions for the House of Denise admin.
 *
 * DB constraint (bookings.status) currently allows:
 * draft | pending | pending_payment | payment_pending | pending_review |
 * confirmed | changes_requested | cancelled | rescheduled | completed |
 * no_show | declined
 *
 * Target experience-business vocabulary (display + future writes):
 * inquiry | consultation | proposal_sent | awaiting_deposit | deposit_paid |
 * confirmed | scheduled | completed | cancelled | refunded
 *
 * Phase 1 preserves DB values and maps them for display/control.
 */

export const BOOKING_DB_STATUSES = [
  "draft",
  "pending",
  "pending_payment",
  "payment_pending",
  "pending_review",
  "confirmed",
  "changes_requested",
  "cancelled",
  "rescheduled",
  "completed",
  "no_show",
  "declined"
] as const;

export type BookingDbStatus = (typeof BOOKING_DB_STATUSES)[number];

export const BOOKING_DISPLAY_STATUSES = [
  "inquiry",
  "consultation",
  "proposal_sent",
  "awaiting_deposit",
  "deposit_paid",
  "confirmed",
  "scheduled",
  "completed",
  "cancelled",
  "refunded"
] as const;

export type BookingDisplayStatus = (typeof BOOKING_DISPLAY_STATUSES)[number];

export const BOOKING_PAYMENT_STATUSES = [
  "not_required",
  "unpaid",
  "pending",
  "deposit_paid",
  "paid",
  "partially_refunded",
  "refunded",
  "failed"
] as const;

export type BookingPaymentStatus = (typeof BOOKING_PAYMENT_STATUSES)[number];

/** Statuses an admin may set in Phase 1 (subset of DB-allowed values). */
export const BOOKING_ADMIN_WRITABLE_STATUSES = [
  "pending",
  "pending_payment",
  "pending_review",
  "confirmed",
  "changes_requested",
  "cancelled",
  "rescheduled",
  "completed",
  "declined"
] as const;

export type BookingAdminWritableStatus =
  (typeof BOOKING_ADMIN_WRITABLE_STATUSES)[number];

const DB_TO_DISPLAY: Record<string, BookingDisplayStatus> = {
  draft: "inquiry",
  pending: "consultation",
  pending_review: "consultation",
  pending_payment: "awaiting_deposit",
  payment_pending: "awaiting_deposit",
  confirmed: "confirmed",
  changes_requested: "consultation",
  rescheduled: "scheduled",
  completed: "completed",
  cancelled: "cancelled",
  declined: "cancelled",
  no_show: "completed"
};

const DISPLAY_LABELS: Record<BookingDisplayStatus, string> = {
  inquiry: "Inquiry",
  consultation: "Consultation",
  proposal_sent: "Proposal sent",
  awaiting_deposit: "Awaiting deposit",
  deposit_paid: "Deposit paid",
  confirmed: "Confirmed",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded"
};

const DB_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  pending_payment: "Pending payment",
  payment_pending: "Payment pending",
  pending_review: "Pending review",
  confirmed: "Confirmed",
  changes_requested: "Changes requested",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
  completed: "Completed",
  no_show: "No show",
  declined: "Declined"
};

const PAYMENT_LABELS: Record<string, string> = {
  not_required: "Not required",
  unpaid: "Unpaid",
  pending: "Pending",
  deposit_paid: "Deposit paid",
  paid: "Paid",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  failed: "Failed"
};

export function toDisplayBookingStatus(
  dbStatus: string,
  paymentStatus?: string | null
): BookingDisplayStatus {
  if (paymentStatus === "refunded" || paymentStatus === "partially_refunded") {
    return "refunded";
  }
  if (paymentStatus === "deposit_paid" && dbStatus === "confirmed") {
    return "deposit_paid";
  }
  return DB_TO_DISPLAY[dbStatus] ?? "inquiry";
}

export function displayBookingStatusLabel(status: BookingDisplayStatus | string): string {
  return DISPLAY_LABELS[status as BookingDisplayStatus] ?? status;
}

export function bookingStatusLabel(dbStatus: string, paymentStatus?: string | null): string {
  const display = toDisplayBookingStatus(dbStatus, paymentStatus);
  return DISPLAY_LABELS[display] ?? DB_LABELS[dbStatus] ?? dbStatus;
}

export function bookingDbStatusLabel(dbStatus: string): string {
  return DB_LABELS[dbStatus] ?? dbStatus;
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_LABELS[status] ?? status;
}

export function isBookingDbStatus(value: string): value is BookingDbStatus {
  return (BOOKING_DB_STATUSES as readonly string[]).includes(value);
}

export function isBookingAdminWritableStatus(
  value: string
): value is BookingAdminWritableStatus {
  return (BOOKING_ADMIN_WRITABLE_STATUSES as readonly string[]).includes(value);
}

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export function bookingStatusTone(dbStatus: string): StatusTone {
  switch (toDisplayBookingStatus(dbStatus)) {
    case "confirmed":
    case "scheduled":
    case "deposit_paid":
      return "success";
    case "awaiting_deposit":
    case "proposal_sent":
    case "consultation":
      return "warning";
    case "cancelled":
    case "refunded":
      return "danger";
    case "completed":
      return "info";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): StatusTone {
  switch (status) {
    case "paid":
    case "deposit_paid":
      return "success";
    case "pending":
    case "unpaid":
      return "warning";
    case "failed":
    case "refunded":
    case "partially_refunded":
      return "danger";
    default:
      return "neutral";
  }
}
