import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminPaymentListRow } from "./dashboard-types";
import { clampPage } from "./dashboard-utils";

export type PaymentListFilters = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export type PaymentListResult = {
  rows: AdminPaymentListRow[];
  total: number;
  page: number;
  pageSize: number;
  totals: {
    collectedCents: number;
    pendingCents: number;
    remainingCents: number;
  };
};

/**
 * Payment truth for Phase 1 comes from verified booking rows
 * (amount_paid / deposit / remaining + Square ids) and commerce_orders.
 * Client-submitted amounts are never treated as source of truth here.
 */
export async function listAdminPayments(
  filters: PaymentListFilters = {}
): Promise<PaymentListResult> {
  const admin = getSupabaseAdminClient();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 25, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);

  if (!admin) {
    return {
      rows: [],
      total: 0,
      page: 1,
      pageSize,
      totals: { collectedCents: 0, pendingCents: 0, remainingCents: 0 }
    };
  }

  const [bookingsResult, ordersResult] = await Promise.all([
    admin
      .from("bookings")
      .select(
        "id, reference_number, guest_name, guest_email, payment_status, payment_option, deposit_amount_cents, amount_paid_cents, remaining_balance_cents, subtotal_cents, square_payment_id, square_checkout_id, updated_at, created_at"
      )
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .order("updated_at", { ascending: false })
      .limit(300),
    admin
      .from("commerce_orders")
      .select(
        "id, reference, customer_email, payment_status, total_cents, square_payment_link_id, square_order_id, updated_at, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  const bookingRows: AdminPaymentListRow[] = (bookingsResult.data ?? []).map((row) => {
    const paid = row.amount_paid_cents ?? 0;
    const paymentType =
      row.payment_status === "refunded" || row.payment_status === "partially_refunded"
        ? "refund"
        : row.payment_status === "paid"
          ? "full_payment"
          : row.payment_option === "full"
            ? "full_payment"
            : paid > 0 || row.payment_status === "deposit_paid"
              ? "deposit"
              : "remaining_balance";

    return {
      id: `booking-${row.id}`,
      source: "booking" as const,
      customerName: row.guest_name ?? "Guest",
      customerEmail: row.guest_email,
      reference: row.reference_number,
      paymentType,
      amountCents: paid > 0 ? paid : row.deposit_amount_cents ?? 0,
      status: row.payment_status,
      providerId: row.square_payment_id || row.square_checkout_id,
      date: row.updated_at || row.created_at,
      href: `/admin/bookings/${row.id}`
    };
  });

  const commerceRows: AdminPaymentListRow[] = (ordersResult.data ?? []).map((row) => ({
    id: `commerce-${row.id}`,
    source: "commerce" as const,
    customerName: row.customer_email ?? "Customer",
    customerEmail: row.customer_email,
    reference: row.reference,
    paymentType: "full_payment",
    amountCents: row.total_cents ?? 0,
    status: row.payment_status,
    providerId: row.square_payment_link_id || row.square_order_id,
    date: row.updated_at || row.created_at
  }));

  let rows = [...bookingRows, ...commerceRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const q = filters.q?.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (row) =>
        row.reference.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        (row.customerEmail ?? "").toLowerCase().includes(q) ||
        (row.providerId ?? "").toLowerCase().includes(q)
    );
  }

  const totals = {
    collectedCents: rows
      .filter((r) => ["paid", "deposit_paid"].includes(r.status) || r.amountCents > 0)
      .reduce((sum, r) => sum + r.amountCents, 0),
    pendingCents: rows
      .filter((r) => r.status === "pending" || r.status === "unpaid")
      .reduce((sum, r) => sum + r.amountCents, 0),
    remainingCents: (bookingsResult.data ?? []).reduce(
      (sum, b) => sum + Math.max(0, b.remaining_balance_cents ?? 0),
      0
    )
  };

  const total = rows.length;
  const safePage = clampPage(page, pageSize, total);
  const start = (safePage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totals
  };
}
