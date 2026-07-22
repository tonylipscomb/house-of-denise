import "server-only";

import type { BookingInquiryRecord } from "../data/booking.ts";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "./launchpoint/constants";
import { getSupabaseAdminClient, type BookingInquiryRow } from "./supabase-admin.ts";

export type StoredBookingInquiry = Pick<
  BookingInquiryRow,
  | "reference_number"
  | "created_at"
  | "inquiry_status"
  | "deposit_status"
  | "owner_email_status"
  | "customer_email_status"
>;

export type BookingInquiryInsert = {
  record: BookingInquiryRecord;
  referenceNumber: string;
  submissionFingerprint: string;
  customerId?: string | null;
};

export type BookingStorage = {
  findRecentDuplicate(submissionFingerprint: string, sinceIso: string): Promise<StoredBookingInquiry | null>;
  insertInquiry(input: BookingInquiryInsert): Promise<StoredBookingInquiry>;
  updateEmailStatus(
    referenceNumber: string,
    field: "owner_email_status" | "customer_email_status",
    status: "sent" | "failed"
  ): Promise<void>;
};

export class BookingStorageConfigurationError extends Error {
  constructor() {
    super("Booking storage is not configured.");
    this.name = "BookingStorageConfigurationError";
  }
}

function nullable(value: string) {
  return value || null;
}

function toInsertRow({ record, referenceNumber, submissionFingerprint, customerId }: BookingInquiryInsert) {
  return {
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    customer_id: customerId ?? null,
    reference_number: referenceNumber,
    full_name: record.fullName,
    email: record.email,
    phone: record.phone,
    preferred_contact_method: nullable(record.preferredContactMethod),
    event_type: record.eventType,
    event_date: record.eventDate,
    event_start_time: nullable(record.startTime),
    venue_name: nullable(record.venueName),
    event_city: record.eventCity,
    event_state: record.eventState,
    event_zip: null,
    estimated_guest_count: record.estimatedGuestCount,
    experience_format: record.experienceFormat || "Not Sure Yet",
    event_description: nullable(record.eventVision),
    special_requests: nullable(record.specialRequests),
    referral_source: nullable(record.referralSource),
    consent_accepted: record.consent,
    inquiry_status: record.inquiryStatus,
    deposit_status: record.depositStatus,
    square_checkout_reference: record.squareCheckoutReference,
    square_payment_reference: record.squarePaymentReference,
    owner_email_status: "pending" as const,
    customer_email_status: "pending" as const,
    submission_fingerprint: submissionFingerprint
  };
}

export function createSupabaseBookingStorage(): BookingStorage {
  const getClient = () => {
    const client = getSupabaseAdminClient();
    if (!client) {
      throw new BookingStorageConfigurationError();
    }
    return client;
  };

  return {
    async findRecentDuplicate(submissionFingerprint, sinceIso) {
      const { data, error } = await getClient()
        .from("booking_inquiries")
        .select(
          "reference_number, created_at, inquiry_status, deposit_status, owner_email_status, customer_email_status"
        )
        .eq("submission_fingerprint", submissionFingerprint)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async insertInquiry(input) {
      const { data, error } = await getClient()
        .from("booking_inquiries")
        .insert(toInsertRow(input))
        .select("reference_number, created_at, inquiry_status, deposit_status, owner_email_status, customer_email_status")
        .single();

      if (error) throw error;
      return data;
    },

    async updateEmailStatus(referenceNumber, field, status) {
      const update =
        field === "owner_email_status"
          ? { owner_email_status: status, updated_at: new Date().toISOString() }
          : { customer_email_status: status, updated_at: new Date().toISOString() };

      const { error } = await getClient()
        .from("booking_inquiries")
        .update(update)
        .eq("reference_number", referenceNumber);

      if (error) throw error;
    }
  };
}
