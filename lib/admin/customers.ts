import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatShortDate, formatUsdFromCents } from "./dashboard-utils";

export type CustomerSummary = {
  email: string;
  name: string;
  phone: string | null;
  bookingCount: number;
  inquiryCount: number;
  spendCents: number;
  upcomingCount: number;
  pastCount: number;
  lastActivity: string | null;
};

export type CustomerProfile = CustomerSummary & {
  bookings: Array<{
    id: string;
    referenceNumber: string;
    experience: string | null;
    startAt: string | null;
    status: string;
    paymentStatus: string;
    totalCents: number;
    remainingCents: number;
  }>;
  inquiries: Array<{
    id: string;
    referenceNumber: string;
    eventType: string;
    eventDate: string;
    status: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    reference: string;
    amountCents: number;
    status: string;
    date: string;
    href: string;
  }>;
  notes: Array<{
    id: string;
    body: string;
    createdAt: string;
    authorId: string | null;
  }>;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listCustomers(search = ""): Promise<CustomerSummary[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const [bookingsResult, inquiriesResult] = await Promise.all([
    admin
      .from("bookings")
      .select(
        "guest_name, guest_email, guest_phone, amount_paid_cents, start_at, created_at, updated_at"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(1000),
    admin
      .from("booking_inquiries")
      .select("full_name, email, phone, created_at, updated_at")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(1000)
  ]);

  const map = new Map<string, CustomerSummary>();
  const now = Date.now();

  for (const booking of bookingsResult.data ?? []) {
    const email = normalizeEmail(booking.guest_email || "");
    if (!email) continue;
    const row =
      map.get(email) ??
      ({
        email,
        name: booking.guest_name || "Guest",
        phone: booking.guest_phone,
        bookingCount: 0,
        inquiryCount: 0,
        spendCents: 0,
        upcomingCount: 0,
        pastCount: 0,
        lastActivity: null
      } satisfies CustomerSummary);

    row.bookingCount += 1;
    row.spendCents += booking.amount_paid_cents ?? 0;
    if (booking.guest_name) row.name = booking.guest_name;
    if (booking.guest_phone) row.phone = booking.guest_phone;
    if (booking.start_at) {
      if (new Date(booking.start_at).getTime() >= now) row.upcomingCount += 1;
      else row.pastCount += 1;
    }
    const activity = booking.updated_at || booking.created_at;
    if (!row.lastActivity || activity > row.lastActivity) row.lastActivity = activity;
    map.set(email, row);
  }

  for (const inquiry of inquiriesResult.data ?? []) {
    const email = normalizeEmail(inquiry.email || "");
    if (!email) continue;
    const row =
      map.get(email) ??
      ({
        email,
        name: inquiry.full_name || "Guest",
        phone: inquiry.phone,
        bookingCount: 0,
        inquiryCount: 0,
        spendCents: 0,
        upcomingCount: 0,
        pastCount: 0,
        lastActivity: null
      } satisfies CustomerSummary);

    row.inquiryCount += 1;
    if (inquiry.full_name) row.name = inquiry.full_name;
    if (inquiry.phone) row.phone = inquiry.phone;
    const activity = inquiry.updated_at || inquiry.created_at;
    if (!row.lastActivity || activity > row.lastActivity) row.lastActivity = activity;
    map.set(email, row);
  }

  let rows = [...map.values()].sort((a, b) => b.bookingCount - a.bookingCount);
  const q = search.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.email.includes(q) ||
        (row.phone ?? "").includes(q)
    );
  }
  return rows;
}

export async function getCustomerProfile(emailInput: string): Promise<CustomerProfile | null> {
  const email = normalizeEmail(emailInput);
  if (!email) return null;
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const [bookingsResult, inquiriesResult, notesResult] = await Promise.all([
    admin
      .from("bookings")
      .select(
        "id, reference_number, guest_name, guest_phone, experience_slug, start_at, status, payment_status, subtotal_cents, remaining_balance_cents, amount_paid_cents, created_at, updated_at"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .ilike("guest_email", email)
      .order("created_at", { ascending: false }),
    admin
      .from("booking_inquiries")
      .select(
        "id, reference_number, full_name, phone, event_type, event_date, inquiry_status, created_at"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .ilike("email", email)
      .order("created_at", { ascending: false }),
    admin
      .from("customer_notes")
      .select("id, body, created_at, author_id")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .ilike("customer_email", email)
      .order("created_at", { ascending: false })
  ]);

  const bookings = bookingsResult.data ?? [];
  const inquiries = inquiriesResult.data ?? [];
  if (!bookings.length && !inquiries.length) return null;

  const now = Date.now();
  const name =
    bookings[0]?.guest_name || inquiries[0]?.full_name || "Guest";
  const phone = bookings[0]?.guest_phone || inquiries[0]?.phone || null;

  return {
    email,
    name,
    phone,
    bookingCount: bookings.length,
    inquiryCount: inquiries.length,
    spendCents: bookings.reduce((sum, row) => sum + (row.amount_paid_cents ?? 0), 0),
    upcomingCount: bookings.filter(
      (row) => row.start_at && new Date(row.start_at).getTime() >= now
    ).length,
    pastCount: bookings.filter(
      (row) => row.start_at && new Date(row.start_at).getTime() < now
    ).length,
    lastActivity:
      [...bookings.map((b) => b.updated_at || b.created_at), ...inquiries.map((i) => i.created_at)]
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    bookings: bookings.map((row) => ({
      id: row.id,
      referenceNumber: row.reference_number,
      experience: row.experience_slug,
      startAt: row.start_at,
      status: row.status,
      paymentStatus: row.payment_status,
      totalCents: row.subtotal_cents ?? 0,
      remainingCents: row.remaining_balance_cents ?? 0
    })),
    inquiries: inquiries.map((row) => ({
      id: row.id,
      referenceNumber: row.reference_number,
      eventType: row.event_type,
      eventDate: row.event_date,
      status: row.inquiry_status,
      createdAt: row.created_at
    })),
    payments: bookings
      .filter((row) => (row.amount_paid_cents ?? 0) > 0 || row.payment_status !== "unpaid")
      .map((row) => ({
        id: row.id,
        reference: row.reference_number,
        amountCents: row.amount_paid_cents ?? 0,
        status: row.payment_status,
        date: row.updated_at || row.created_at,
        href: `/admin/bookings/${row.id}`
      })),
    notes: (notesResult.data ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      authorId: row.author_id
    }))
  };
}

export async function addCustomerNote(input: {
  email: string;
  body: string;
  actorUserId: string;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");
  const email = normalizeEmail(input.email);
  const body = input.body.trim();
  if (!email || !body) throw new Error("Email and note body are required.");

  const { error } = await admin.from("customer_notes").insert({
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    customer_email: email,
    author_id: input.actorUserId,
    body
  });
  if (error) throw new Error(error.message);
}

export function customerSpendLabel(cents: number) {
  return formatUsdFromCents(cents);
}

export function customerActivityLabel(value: string | null) {
  return formatShortDate(value);
}
