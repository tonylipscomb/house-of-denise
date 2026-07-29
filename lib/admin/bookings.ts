import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminBookingListRow } from "./dashboard-types";
import { clampPage } from "./dashboard-utils";

export type BookingListFilters = {
  q?: string;
  status?: string;
  paymentStatus?: string;
  experience?: string;
  tab?: "all" | "upcoming" | "past";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type BookingListResult = {
  rows: AdminBookingListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listAdminBookings(
  filters: BookingListFilters = {}
): Promise<BookingListResult> {
  const admin = getSupabaseAdminClient();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 25, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);

  if (!admin) {
    return { rows: [], total: 0, page: 1, pageSize };
  }

  let query = admin
    .from("bookings")
    .select(
      "id, reference_number, guest_name, guest_email, guest_phone, experience_slug, package_slug, start_at, guest_count, status, payment_status, subtotal_cents, deposit_amount_cents, remaining_balance_cents, updated_at",
      { count: "exact" }
    )
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID);

  const now = new Date().toISOString();
  if (filters.tab === "upcoming") {
    query = query.gte("start_at", now);
  } else if (filters.tab === "past") {
    query = query.lt("start_at", now);
  }

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
  if (filters.experience) query = query.eq("experience_slug", filters.experience);
  if (filters.from) query = query.gte("start_at", filters.from);
  if (filters.to) query = query.lte("start_at", filters.to);

  const q = filters.q?.trim();
  if (q) {
    // PostgREST or() filter for search
    const escaped = q.replace(/,/g, " ");
    query = query.or(
      `reference_number.ilike.%${escaped}%,guest_name.ilike.%${escaped}%,guest_email.ilike.%${escaped}%,guest_phone.ilike.%${escaped}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order(filters.tab === "upcoming" ? "start_at" : "created_at", {
      ascending: filters.tab === "upcoming"
    })
    .range(from, to);

  if (error) {
    console.error("[admin] listAdminBookings", error.message);
    return { rows: [], total: 0, page: 1, pageSize };
  }

  const total = count ?? 0;
  const safePage = clampPage(page, pageSize, total);

  const rows: AdminBookingListRow[] = (data ?? []).map((row) => ({
    id: row.id,
    referenceNumber: row.reference_number,
    customerName: row.guest_name ?? "Guest",
    customerEmail: row.guest_email,
    customerPhone: row.guest_phone,
    experienceSlug: row.experience_slug,
    packageSlug: row.package_slug,
    eventDate: row.start_at,
    guestCount: row.guest_count,
    status: row.status,
    paymentStatus: row.payment_status,
    depositCents: row.deposit_amount_cents ?? 0,
    totalCents: row.subtotal_cents ?? 0,
    remainingCents: row.remaining_balance_cents ?? 0,
    updatedAt: row.updated_at
  }));

  return { rows, total, page: safePage, pageSize };
}
