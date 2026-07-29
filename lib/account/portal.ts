import "server-only";

import {
  bookingStatusLabel,
  paymentStatusLabel
} from "@/lib/admin/booking-status";
import { formatUsdFromCents } from "@/data/booking-catalog";
import { claimBookingsForVerifiedEmail } from "@/lib/booking-wizard/claim-bookings";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { canAccessAdminDashboard } from "@/lib/admin/permissions";
import type { WorkspaceRole } from "@/lib/supabase/types";

export type CustomerBookingSummary = {
  id: string;
  reference: string;
  experience: string;
  packageLabel: string;
  whenLabel: string;
  statusLabel: string;
  paymentLabel: string;
  balanceLabel: string;
  balanceCents: number;
  isUpcoming: boolean;
  href: string;
};

export type CustomerOrderSummary = {
  id: string;
  reference: string;
  statusLabel: string;
  paymentLabel: string;
  totalLabel: string;
  createdLabel: string;
};

export type CustomerPortalData = {
  displayName: string;
  email: string | null;
  profileComplete: boolean;
  isStaff: boolean;
  upcoming: CustomerBookingSummary[];
  recentBookings: CustomerBookingSummary[];
  orders: CustomerOrderSummary[];
  inquiryCount: number;
  upcomingCount: number;
  balanceDueCents: number;
  balanceDueLabel: string;
};

function humanizeSlug(value: string | null | undefined) {
  if (!value) return "Experience";
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function firstName(fullName: string | null | undefined, email: string | null) {
  const name = fullName?.trim();
  if (name) return name.split(/\s+/)[0] ?? name;
  if (email?.includes("@")) return email.split("@")[0] ?? "there";
  return "there";
}

function formatWhen(startAt: string | null) {
  if (!startAt) return "Date pending";
  return new Date(startAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export async function getCustomerPortalData(options: {
  userId: string;
  email: string | null;
  fullName?: string | null;
  phone?: string | null;
  role: WorkspaceRole;
}): Promise<CustomerPortalData> {
  await claimBookingsForVerifiedEmail({
    userId: options.userId,
    email: options.email
  });

  const admin = getSupabaseAdminClient();
  const nowMs = Date.now();

  if (!admin) {
    return {
      displayName: firstName(options.fullName, options.email),
      email: options.email,
      profileComplete: Boolean(options.fullName && options.phone),
      isStaff: canAccessAdminDashboard(options.role),
      upcoming: [],
      recentBookings: [],
      orders: [],
      inquiryCount: 0,
      upcomingCount: 0,
      balanceDueCents: 0,
      balanceDueLabel: formatUsdFromCents(0)
    };
  }

  const email = options.email?.trim().toLowerCase() ?? "";

  const [bookingsResult, inquiriesResult, ordersById, ordersByEmail] =
    await Promise.all([
      admin
        .from("bookings")
        .select(
          "id, reference_number, start_at, status, payment_status, experience_slug, package_slug, remaining_balance_cents, subtotal_cents, deposit_amount_cents"
        )
        .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
        .eq("customer_id", options.userId)
        .order("created_at", { ascending: false })
        .limit(12),
      admin
        .from("booking_inquiries")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
        .eq("customer_id", options.userId),
      admin
        .from("commerce_orders")
        .select(
          "id, reference, status, payment_status, total_cents, created_at, customer_id, customer_email"
        )
        .eq("customer_id", options.userId)
        .order("created_at", { ascending: false })
        .limit(6),
      email
        ? admin
            .from("commerce_orders")
            .select(
              "id, reference, status, payment_status, total_cents, created_at, customer_id, customer_email"
            )
            .ilike("customer_email", email)
            .order("created_at", { ascending: false })
            .limit(6)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> })
    ]);

  const orderMap = new Map<string, Record<string, unknown>>();
  for (const row of [...(ordersById.data ?? []), ...(ordersByEmail.data ?? [])]) {
    orderMap.set(String(row.id), row as Record<string, unknown>);
  }
  const orderRows = Array.from(orderMap.values()).slice(0, 6);

  const bookings = (bookingsResult.data ?? []).map((booking) => {
    const startMs = booking.start_at
      ? new Date(booking.start_at).getTime()
      : NaN;
    const isUpcoming =
      Number.isFinite(startMs) &&
      startMs >= nowMs &&
      !["cancelled", "declined", "completed"].includes(booking.status);

    return {
      id: booking.id,
      reference: booking.reference_number,
      experience: humanizeSlug(booking.experience_slug),
      packageLabel: humanizeSlug(booking.package_slug),
      whenLabel: formatWhen(booking.start_at),
      statusLabel: bookingStatusLabel(booking.status, booking.payment_status),
      paymentLabel: paymentStatusLabel(booking.payment_status),
      balanceCents: booking.remaining_balance_cents ?? 0,
      balanceLabel: formatUsdFromCents(booking.remaining_balance_cents ?? 0),
      isUpcoming,
      href: `/account/bookings/${encodeURIComponent(booking.reference_number)}`
    } satisfies CustomerBookingSummary;
  });

  const upcoming = bookings.filter((booking) => booking.isUpcoming);
  const balanceDueCents = bookings.reduce(
    (sum, booking) => sum + Math.max(0, booking.balanceCents),
    0
  );

  const orders = orderRows.map((order) => ({
    id: String(order.id),
    reference: String(order.reference),
    statusLabel: String(order.status).replaceAll("_", " "),
    paymentLabel: String(order.payment_status).replaceAll("_", " "),
    totalLabel: formatUsdFromCents(Number(order.total_cents ?? 0)),
    createdLabel: new Date(String(order.created_at)).toLocaleDateString(
      "en-US",
      { dateStyle: "medium" }
    )
  }));

  return {
    displayName: firstName(options.fullName, options.email),
    email: options.email,
    profileComplete: Boolean(options.fullName && options.phone),
    isStaff: canAccessAdminDashboard(options.role),
    upcoming,
    recentBookings: bookings.slice(0, 5),
    orders,
    inquiryCount: inquiriesResult.count ?? 0,
    upcomingCount: upcoming.length,
    balanceDueCents,
    balanceDueLabel: formatUsdFromCents(balanceDueCents)
  };
}
