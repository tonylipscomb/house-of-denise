import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminInquiryListRow } from "./dashboard-types";
import { clampPage } from "./dashboard-utils";
import { isInquiryDbStatus } from "./inquiry-status";
import type { BookingInquiryRow } from "@/lib/supabase/types";

export type InquiryListFilters = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type InquiryListResult = {
  rows: AdminInquiryListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listAdminInquiries(
  filters: InquiryListFilters = {}
): Promise<InquiryListResult> {
  const admin = getSupabaseAdminClient();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 25, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);

  if (!admin) {
    return { rows: [], total: 0, page: 1, pageSize };
  }

  let query = admin
    .from("booking_inquiries")
    .select(
      "id, reference_number, full_name, email, phone, event_type, event_date, experience_format, estimated_guest_count, inquiry_status, converted_booking_id, created_at, submission_fingerprint",
      { count: "exact" }
    )
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID);

  if (filters.status) {
    if (filters.status === "converted") {
      query = query.not("converted_booking_id", "is", null);
    } else if (filters.status === "contacted") {
      query = query.in("inquiry_status", ["contacted", "reviewing"]);
    } else if (filters.status === "proposal_sent") {
      query = query.in("inquiry_status", ["proposal_sent", "followed-up"]);
    } else {
      query = query.eq(
        "inquiry_status",
        filters.status as BookingInquiryRow["inquiry_status"]
      );
    }
  }

  const q = filters.q?.trim();
  if (q) {
    const escaped = q.replace(/,/g, " ");
    query = query.or(
      `reference_number.ilike.%${escaped}%,full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[admin] listAdminInquiries", error.message);
    return { rows: [], total: 0, page: 1, pageSize };
  }

  const total = count ?? 0;
  const rows: AdminInquiryListRow[] = (data ?? []).map((row) => ({
    id: row.id,
    referenceNumber: row.reference_number,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    eventType: row.event_type,
    eventDate: row.event_date,
    experienceFormat: row.experience_format,
    guestCount: row.estimated_guest_count,
    inquiryStatus: row.inquiry_status,
    convertedBookingId: row.converted_booking_id,
    createdAt: row.created_at,
    submissionFingerprint: row.submission_fingerprint
  }));

  return { rows, total, page: clampPage(page, pageSize, total), pageSize };
}

export async function getAdminInquiry(id: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("booking_inquiries")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getAdminInquiry", error.message);
    return null;
  }

  return data;
}

export async function updateInquiryStatus(params: {
  inquiryId: string;
  status: string;
  actorUserId: string;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");
  if (!isInquiryDbStatus(params.status)) {
    throw new Error(`Unsupported inquiry status: ${params.status}`);
  }

  const { data, error } = await admin
    .from("booking_inquiries")
    .update({
      inquiry_status: params.status,
      updated_at: new Date().toISOString()
    })
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", params.inquiryId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Inquiry not found.");

  // Optional audit note
  await admin.from("admin_notes").insert({
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    booking_inquiry_id: params.inquiryId,
    author_id: params.actorUserId,
    body: `Inquiry status updated to ${params.status}`
  });

  return data;
}
