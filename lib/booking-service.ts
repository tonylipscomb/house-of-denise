import { createHash, randomBytes } from "node:crypto";

import type { BookingInquiryRecord, BookingSubmissionResponse, BookingValidationErrors } from "../data/booking.ts";
import {
  createBookingInquiryRecord,
  normalizeBookingSubmissionPayload,
  validateBookingInquiry
} from "./booking-validation.ts";
import type { BookingStorage, StoredBookingInquiry } from "./booking-storage.ts";

const duplicateWindowMinutes = 10;
const minimumCompletionMs = 2500;

export type BookingMailer = {
  sendOwner(input: { referenceNumber: string; record: BookingInquiryRecord; createdAt: string }): Promise<void>;
  sendCustomer(input: { referenceNumber: string; record: BookingInquiryRecord; createdAt: string }): Promise<void>;
};

export type SubmitBookingInquiryDependencies = {
  storage?: BookingStorage;
  mailer?: BookingMailer;
  now?: () => Date;
  referenceGenerator?: (now: Date) => string;
  logger?: Pick<Console, "warn" | "error">;
  customerId?: string | null;
};

export type SubmitBookingInquiryResult = {
  response: BookingSubmissionResponse;
  status: number;
};

function safeFailureMessage() {
  return "We could not submit your inquiry right now. Please try again or contact House Of Denise directly.";
}

function normalizePhoneForFingerprint(phone: string) {
  return phone.replace(/\D/g, "");
}

export function createSubmissionFingerprint(record: BookingInquiryRecord) {
  const source = [
    record.email.toLowerCase(),
    normalizePhoneForFingerprint(record.phone),
    record.eventDate,
    record.eventType,
    record.estimatedGuestCount
  ].join("|");

  return createHash("sha256").update(source).digest("hex");
}

export function generateInquiryReference(now = new Date()) {
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  const random = randomBytes(4)
    .toString("base64url")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 6)
    .padEnd(6, "0");

  return `HOD-${now.getFullYear()}${month}${day}-${random}`;
}

function getAbuseErrors(input: ReturnType<typeof normalizeBookingSubmissionPayload>, now: Date): BookingValidationErrors | null {
  if (input.companyWebsite) return {};
  if (!input.formStartedAt) return null;

  const startedAt = Date.parse(input.formStartedAt);
  if (Number.isNaN(startedAt)) return {};
  if (now.getTime() - startedAt < minimumCompletionMs) return {};

  return null;
}

function logEmailFailure(
  logger: Pick<Console, "warn" | "error">,
  referenceNumber: string,
  emailType: "owner" | "customer",
  error: unknown
) {
  const category = error instanceof Error ? error.name : "UnknownEmailError";
  logger.warn("Booking email delivery failed", {
    referenceNumber,
    emailType,
    category
  });
}

async function updateEmailStatusSafely(
  storage: BookingStorage,
  logger: Pick<Console, "warn" | "error">,
  referenceNumber: string,
  field: "owner_email_status" | "customer_email_status",
  status: "sent" | "failed"
) {
  try {
    await storage.updateEmailStatus(referenceNumber, field, status);
  } catch (error) {
    logger.warn("Booking email status update failed", {
      referenceNumber,
      field,
      status,
      category: error instanceof Error ? error.name : "UnknownStorageError"
    });
  }
}

export async function submitBookingInquiry(
  input: unknown,
  dependencies: SubmitBookingInquiryDependencies = {}
): Promise<SubmitBookingInquiryResult> {
  const now = dependencies.now?.() ?? new Date();
  const logger = dependencies.logger ?? console;
  const payload = normalizeBookingSubmissionPayload(input);
  const abuseErrors = getAbuseErrors(payload, now);

  if (abuseErrors) {
    return {
      status: 400,
      response: {
        success: false,
        code: "abuse_rejected",
        errors: abuseErrors,
        message: "We could not submit your inquiry right now. Please try again."
      }
    };
  }

  const validation = validateBookingInquiry(payload);

  if (!validation.valid) {
    return {
      status: 400,
      response: {
        success: false,
        code: "validation_error",
        errors: validation.errors,
        message: "Please review the highlighted fields before submitting."
      }
    };
  }

  const storage =
    dependencies.storage ?? (await import("./booking-storage.ts")).createSupabaseBookingStorage();
  const mailer =
    dependencies.mailer ??
    ({
      sendOwner: (await import("./email/booking-emails.ts")).sendOwnerBookingNotification,
      sendCustomer: (await import("./email/booking-emails.ts")).sendCustomerBookingConfirmation
    } satisfies BookingMailer);
  const record = createBookingInquiryRecord(payload);
  const submissionFingerprint = createSubmissionFingerprint(record);
  const duplicateSince = new Date(now.getTime() - duplicateWindowMinutes * 60 * 1000).toISOString();

  try {
    const duplicate = await storage.findRecentDuplicate(submissionFingerprint, duplicateSince);
    if (duplicate) {
      return {
        status: 200,
        response: {
          success: true,
          referenceNumber: duplicate.reference_number,
          status: duplicate.inquiry_status,
          depositStatus: duplicate.deposit_status,
          createdAt: duplicate.created_at,
          message: "Your inquiry has been received."
        }
      };
    }

    let stored: StoredBookingInquiry | null = null;
    for (let attempt = 0; attempt < 3 && !stored; attempt += 1) {
      stored = await storage.insertInquiry({
        record,
        referenceNumber: dependencies.referenceGenerator?.(now) ?? generateInquiryReference(now),
        submissionFingerprint,
        customerId: dependencies.customerId
      });
    }

    if (!stored) {
      throw new Error("Booking inquiry could not be stored.");
    }

    const emailInput = {
      referenceNumber: stored.reference_number,
      record,
      createdAt: stored.created_at
    };

    try {
      await mailer.sendOwner(emailInput);
      await updateEmailStatusSafely(storage, logger, stored.reference_number, "owner_email_status", "sent");
    } catch (error) {
      logEmailFailure(logger, stored.reference_number, "owner", error);
      await updateEmailStatusSafely(storage, logger, stored.reference_number, "owner_email_status", "failed");
    }

    try {
      await mailer.sendCustomer(emailInput);
      await updateEmailStatusSafely(storage, logger, stored.reference_number, "customer_email_status", "sent");
    } catch (error) {
      logEmailFailure(logger, stored.reference_number, "customer", error);
      await updateEmailStatusSafely(storage, logger, stored.reference_number, "customer_email_status", "failed");
    }

    return {
      status: 201,
      response: {
        success: true,
        referenceNumber: stored.reference_number,
        status: stored.inquiry_status,
        depositStatus: stored.deposit_status,
        createdAt: stored.created_at,
        message: "Your inquiry has been received."
      }
    };
} catch (error: unknown) {
  const supabaseError =
    error && typeof error === "object"
      ? (error as {
          name?: unknown;
          message?: unknown;
          code?: unknown;
          details?: unknown;
          hint?: unknown;
        })
      : null;

  logger.error("Booking inquiry storage failed", {
    category:
      error instanceof Error
        ? error.name
        : typeof supabaseError?.code === "string"
          ? "SupabaseStorageError"
          : "UnknownStorageError",
    message:
      error instanceof Error
        ? error.message
        : typeof supabaseError?.message === "string"
          ? supabaseError.message
          : undefined,
    code:
      typeof supabaseError?.code === "string"
        ? supabaseError.code
        : undefined,
    details:
      typeof supabaseError?.details === "string"
        ? supabaseError.details
        : undefined,
    hint:
      typeof supabaseError?.hint === "string"
        ? supabaseError.hint
        : undefined
  });

    return {
      status: 503,
      response: {
        success: false,
        code: "storage_error",
        errors: {},
        message: safeFailureMessage()
      }
    };
  }
}
