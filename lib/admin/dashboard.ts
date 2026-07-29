import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  bookingStatusLabel,
  displayBookingStatusLabel,
  toDisplayBookingStatus
} from "./booking-status";
import type {
  DashboardKpi,
  DashboardListItem,
  DashboardOverview,
  ExperienceCount,
  RevenuePoint,
  StatusCount
} from "./dashboard-types";
import {
  buildLastNDayBuckets,
  countBy,
  formatPercent,
  formatShortDate,
  formatUsdFromCents,
  humanizeSlug,
  startOfDayIso
} from "./dashboard-utils";
import { inquiryStatusLabel } from "./inquiry-status";

type BookingRow = {
  id: string;
  reference_number: string;
  guest_name: string | null;
  guest_email: string | null;
  experience_slug: string | null;
  package_slug: string | null;
  start_at: string | null;
  status: string;
  payment_status: string;
  subtotal_cents: number | null;
  deposit_amount_cents: number | null;
  amount_paid_cents: number | null;
  remaining_balance_cents: number | null;
  created_at: string;
  updated_at: string;
};

type InquiryRow = {
  id: string;
  reference_number: string;
  full_name: string;
  email: string;
  event_type: string;
  event_date: string;
  inquiry_status: string;
  converted_booking_id: string | null;
  created_at: string;
};

type UpgradeRow = {
  upgrade_slug: string;
  name: string;
};

export async function getDashboardOverview(days = 30): Promise<DashboardOverview> {
  const admin = getSupabaseAdminClient();
  const empty: DashboardOverview = {
    kpis: emptyKpis(),
    revenueSeries: buildLastNDayBuckets(days).map((b) => ({
      date: b.key,
      label: b.label,
      amountCents: 0
    })),
    bookingStatusOverview: [],
    upcomingEvents: [],
    recentInquiries: [],
    recentPayments: [],
    recentCustomers: [],
    topExperiences: [],
    topPackages: [],
    topUpgrades: []
  };

  if (!admin) return empty;

  const since = startOfDayIso(days);
  const nowIso = new Date().toISOString();

  const [
    bookingsResult,
    inquiriesResult,
    upcomingResult,
    recentInquiriesResult,
    upgradesResult,
    customersResult
  ] = await Promise.all([
    admin
      .from("bookings")
      .select(
        "id, reference_number, guest_name, guest_email, experience_slug, package_slug, start_at, status, payment_status, subtotal_cents, deposit_amount_cents, amount_paid_cents, remaining_balance_cents, created_at, updated_at"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(500),
    admin
      .from("booking_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .eq("inquiry_status", "new"),
    admin
      .from("bookings")
      .select(
        "id, reference_number, guest_name, experience_slug, start_at, status, payment_status"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .gte("start_at", nowIso)
      .order("start_at", { ascending: true })
      .limit(8),
    admin
      .from("booking_inquiries")
      .select(
        "id, reference_number, full_name, email, event_type, event_date, inquiry_status, converted_booking_id, created_at"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("booking_upgrades")
      .select("upgrade_slug, name")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .limit(500),
    admin
      .from("bookings")
      .select("id, guest_name, guest_email, created_at, subtotal_cents")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  const bookings = (bookingsResult.data ?? []) as BookingRow[];
  const upgrades = (upgradesResult.data ?? []) as UpgradeRow[];
  const recentInquiryRows = (recentInquiriesResult.data ?? []) as InquiryRow[];

  const totalRevenueCents = bookings.reduce(
    (sum, b) => sum + (b.amount_paid_cents ?? 0),
    0
  );
  const depositsCollectedCents = bookings
    .filter(
      (b) =>
        b.payment_status === "deposit_paid" ||
        b.payment_status === "paid" ||
        (b.amount_paid_cents ?? 0) > 0
    )
    .reduce((sum, b) => {
      if (b.payment_status === "paid") {
        return sum + (b.deposit_amount_cents ?? b.amount_paid_cents ?? 0);
      }
      return sum + Math.min(b.amount_paid_cents ?? 0, b.deposit_amount_cents ?? b.amount_paid_cents ?? 0);
    }, 0);
  const remainingBalancesCents = bookings.reduce(
    (sum, b) => sum + Math.max(0, b.remaining_balance_cents ?? 0),
    0
  );
  const upcomingCount = (upcomingResult.data ?? []).length;
  const newInquiries = inquiriesResult.count ?? 0;
  const awaitingApproval = bookings.filter(
    (b) =>
      b.status === "pending_review" ||
      b.status === "pending" ||
      b.status === "pending_payment" ||
      b.status === "payment_pending"
  ).length;

  const paidOrConfirmed = bookings.filter(
    (b) =>
      b.payment_status === "paid" ||
      b.payment_status === "deposit_paid" ||
      b.status === "confirmed" ||
      b.status === "completed"
  ).length;
  const conversionRate =
    bookings.length > 0 ? (paidOrConfirmed / bookings.length) * 100 : 0;
  const avgBookingValue =
    bookings.length > 0
      ? bookings.reduce((sum, b) => sum + (b.subtotal_cents ?? 0), 0) /
        bookings.length
      : 0;

  const kpis: DashboardKpi[] = [
    {
      id: "revenue",
      label: "Total revenue",
      value: formatUsdFromCents(totalRevenueCents),
      hint: "Amount paid across bookings",
      tone: "gold"
    },
    {
      id: "deposits",
      label: "Deposits collected",
      value: formatUsdFromCents(depositsCollectedCents),
      hint: "From deposit and paid bookings"
    },
    {
      id: "remaining",
      label: "Remaining balances",
      value: formatUsdFromCents(remainingBalancesCents),
      tone: remainingBalancesCents > 0 ? "warning" : "default"
    },
    {
      id: "upcoming",
      label: "Upcoming experiences",
      value: String(upcomingCount),
      hint: "Scheduled start dates ahead"
    },
    {
      id: "inquiries",
      label: "New inquiries",
      value: String(newInquiries),
      tone: newInquiries > 0 ? "warning" : "default"
    },
    {
      id: "approval",
      label: "Awaiting approval",
      value: String(awaitingApproval),
      tone: awaitingApproval > 0 ? "warning" : "default"
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: formatPercent(conversionRate),
      hint: "Paid or confirmed / all bookings"
    },
    {
      id: "aov",
      label: "Average booking value",
      value: formatUsdFromCents(avgBookingValue),
      hint: "Based on booking subtotals"
    }
  ];

  const buckets = buildLastNDayBuckets(days);
  for (const booking of bookings) {
    if (booking.created_at < since) continue;
    const key = booking.created_at.slice(0, 10);
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.amountCents += booking.amount_paid_cents ?? 0;
  }
  const revenueSeries: RevenuePoint[] = buckets.map((b) => ({
    date: b.key,
    label: b.label,
    amountCents: b.amountCents
  }));

  const statusCounts = countBy(bookings, (b) =>
    toDisplayBookingStatus(b.status, b.payment_status)
  );
  const bookingStatusOverview: StatusCount[] = statusCounts.map((row) => ({
    status: row.key,
    label: displayBookingStatusLabel(row.key),
    count: row.count
  }));

  const upcomingEvents: DashboardListItem[] = (upcomingResult.data ?? []).map(
    (row) => ({
      id: row.id,
      title: row.reference_number,
      subtitle: `${row.guest_name ?? "Guest"} · ${humanizeSlug(row.experience_slug)}`,
      meta: formatShortDate(row.start_at),
      href: `/admin/bookings/${row.id}`,
      status: bookingStatusLabel(row.status),
      statusTone: row.status
    })
  );

  const recentInquiries: DashboardListItem[] = recentInquiryRows.map((row) => ({
    id: row.id,
    title: row.full_name,
    subtitle: `${row.event_type} · ${row.reference_number}`,
    meta: formatShortDate(row.created_at),
    href: `/admin/inquiries?focus=${row.id}`,
    status: inquiryStatusLabel(row.inquiry_status, row.converted_booking_id),
    statusTone: row.inquiry_status
  }));

  const recentPayments: DashboardListItem[] = bookings
    .filter((b) => (b.amount_paid_cents ?? 0) > 0 || b.payment_status === "pending")
    .slice(0, 8)
    .map((b) => ({
      id: b.id,
      title: formatUsdFromCents(b.amount_paid_cents ?? b.deposit_amount_cents ?? 0),
      subtitle: `${b.reference_number} · ${b.guest_name ?? "Guest"}`,
      meta: formatShortDate(b.updated_at || b.created_at),
      href: `/admin/bookings/${b.id}`,
      status: b.payment_status,
      statusTone: b.payment_status
    }));

  const recentCustomers: DashboardListItem[] = (customersResult.data ?? []).map(
    (row) => ({
      id: row.id,
      title: row.guest_name ?? "Guest",
      subtitle: row.guest_email ?? "No email",
      meta: formatShortDate(row.created_at),
      href: `/admin/customers`
    })
  );

  const topExperiences: ExperienceCount[] = countBy(
    bookings,
    (b) => b.experience_slug ?? "unspecified"
  )
    .slice(0, 5)
    .map((row) => ({
      slug: row.key,
      label: humanizeSlug(row.key),
      count: row.count
    }));

  const topPackages: ExperienceCount[] = countBy(
    bookings,
    (b) => b.package_slug ?? "unspecified"
  )
    .slice(0, 5)
    .map((row) => ({
      slug: row.key,
      label: humanizeSlug(row.key),
      count: row.count
    }));

  const topUpgrades: ExperienceCount[] = countBy(
    upgrades,
    (u) => u.upgrade_slug || u.name || "unspecified"
  )
    .slice(0, 5)
    .map((row) => ({
      slug: row.key,
      label: humanizeSlug(row.key),
      count: row.count
    }));

  return {
    kpis,
    revenueSeries,
    bookingStatusOverview,
    upcomingEvents,
    recentInquiries,
    recentPayments,
    recentCustomers,
    topExperiences,
    topPackages,
    topUpgrades
  };
}

function emptyKpis(): DashboardKpi[] {
  return [
    { id: "revenue", label: "Total revenue", value: "$0.00" },
    { id: "deposits", label: "Deposits collected", value: "$0.00" },
    { id: "remaining", label: "Remaining balances", value: "$0.00" },
    { id: "upcoming", label: "Upcoming experiences", value: "0" },
    { id: "inquiries", label: "New inquiries", value: "0" },
    { id: "approval", label: "Awaiting approval", value: "0" },
    { id: "conversion", label: "Conversion rate", value: "—" },
    { id: "aov", label: "Average booking value", value: "$0.00" }
  ];
}
