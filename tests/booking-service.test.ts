import test from "node:test";
import assert from "node:assert/strict";

import type { BookingInquiryRecord } from "../data/booking.ts";
import {
  createSubmissionFingerprint,
  generateInquiryReference,
  submitBookingInquiry
} from "../lib/booking-service.ts";
import type { BookingStorage, StoredBookingInquiry } from "../lib/booking-storage.ts";

const now = new Date("2026-07-22T16:00:00.000Z");

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "Avery Stone",
    email: "AVERY@example.com",
    phone: "(804) 555-0199",
    preferredContactMethod: "Email",
    eventType: "Birthday",
    eventDate: "2026-08-30",
    startTime: "15:30",
    eventCity: "Richmond",
    eventState: "VA",
    venueName: "The Conservatory",
    estimatedGuestCount: "36",
    experienceFormat: "Private Fragrance Experience",
    eventVision: "A warm fragrance bar for close friends.",
    specialRequests: "Soft florals.",
    referralSource: "Instagram",
    consent: true,
    companyWebsite: "",
    formStartedAt: "2026-07-22T15:59:50.000Z",
    ...overrides
  };
}

function stored(referenceNumber = "HOD-20260722-A7K3Q9"): StoredBookingInquiry {
  return {
    reference_number: referenceNumber,
    created_at: now.toISOString(),
    inquiry_status: "new",
    deposit_status: "not_requested",
    owner_email_status: "pending",
    customer_email_status: "pending"
  };
}

function createStorage(options: {
  duplicate?: StoredBookingInquiry | null;
  insertError?: Error;
  inserted?: StoredBookingInquiry;
  onInsert?: (input: { record: BookingInquiryRecord; referenceNumber: string; submissionFingerprint: string }) => void;
} = {}) {
  const updates: Array<{ referenceNumber: string; field: string; status: string }> = [];
  const storage: BookingStorage = {
    async findRecentDuplicate() {
      return options.duplicate ?? null;
    },
    async insertInquiry(input) {
      options.onInsert?.(input);
      if (options.insertError) throw options.insertError;
      return options.inserted ?? stored();
    },
    async updateEmailStatus(referenceNumber, field, status) {
      updates.push({ referenceNumber, field, status });
    }
  };

  return { storage, updates };
}

function createMailer(options: { ownerFails?: boolean; customerFails?: boolean } = {}) {
  const attempts: Array<{ type: "owner" | "customer"; referenceNumber: string; eventDate: string }> = [];

  return {
    attempts,
    mailer: {
      async sendOwner(input: { referenceNumber: string; record: BookingInquiryRecord }) {
        attempts.push({ type: "owner", referenceNumber: input.referenceNumber, eventDate: input.record.eventDate });
        if (options.ownerFails) throw new Error("owner failed");
      },
      async sendCustomer(input: { referenceNumber: string; record: BookingInquiryRecord }) {
        attempts.push({ type: "customer", referenceNumber: input.referenceNumber, eventDate: input.record.eventDate });
        if (options.customerFails) throw new Error("customer failed");
      }
    }
  };
}

test("valid submission is stored and sends owner and customer emails", async () => {
  const insertedRecords: BookingInquiryRecord[] = [];
  const { storage, updates } = createStorage({
    onInsert(input) {
      insertedRecords.push(input.record);
    }
  });
  const { mailer, attempts } = createMailer();

  const result = await submitBookingInquiry(validPayload(), {
    storage,
    mailer,
    now: () => now,
    referenceGenerator: () => "HOD-20260722-A7K3Q9"
  });

  assert.equal(result.status, 201);
  assert.equal(result.response.success, true);
  assert.equal(result.response.success && result.response.referenceNumber, "HOD-20260722-A7K3Q9");
  assert.equal(insertedRecords[0]?.eventDate, "2026-08-30");
  assert.equal(insertedRecords[0]?.estimatedGuestCount, 36);
  assert.deepEqual(
    attempts.map((attempt) => attempt.type),
    ["owner", "customer"]
  );
  assert.deepEqual(
    updates.map(({ field, status }) => `${field}:${status}`),
    ["owner_email_status:sent", "customer_email_status:sent"]
  );
});

test("invalid submissions are rejected before storage or email", async () => {
  let inserted = false;
  const { storage } = createStorage({
    onInsert() {
      inserted = true;
    }
  });
  const { mailer, attempts } = createMailer();

  const result = await submitBookingInquiry(validPayload({ email: "bad-email" }), {
    storage,
    mailer,
    now: () => now
  });

  assert.equal(result.status, 400);
  assert.equal(result.response.success, false);
  assert.equal(result.response.success ? "" : result.response.code, "validation_error");
  assert.equal(inserted, false);
  assert.equal(attempts.length, 0);
});

test("past dates, nonpositive guests, and missing consent are rejected", async () => {
  const cases = [
    validPayload({ eventDate: "2026-07-21" }),
    validPayload({ estimatedGuestCount: "0" }),
    validPayload({ estimatedGuestCount: "-4" }),
    validPayload({ consent: false })
  ];

  for (const payload of cases) {
    const result = await submitBookingInquiry(payload, {
      storage: createStorage().storage,
      mailer: createMailer().mailer,
      now: () => now
    });

    assert.equal(result.status, 400);
    assert.equal(result.response.success, false);
  }
});

test("duplicate submissions return the existing reference without new insert or email", async () => {
  let inserted = false;
  const { storage } = createStorage({
    duplicate: stored("HOD-20260722-DUPE01"),
    onInsert() {
      inserted = true;
    }
  });
  const { mailer, attempts } = createMailer();

  const result = await submitBookingInquiry(validPayload(), {
    storage,
    mailer,
    now: () => now
  });

  assert.equal(result.status, 200);
  assert.equal(result.response.success && result.response.referenceNumber, "HOD-20260722-DUPE01");
  assert.equal(inserted, false);
  assert.equal(attempts.length, 0);
});

test("reference numbers use the public HOD date format", () => {
  assert.match(generateInquiryReference(now), /^HOD-20260722-[A-Z0-9]{6}$/);
});

test("storage errors return a safe response", async () => {
  const result = await submitBookingInquiry(validPayload(), {
    storage: createStorage({ insertError: new Error("database secret detail") }).storage,
    mailer: createMailer().mailer,
    now: () => now,
    logger: { warn() {}, error() {} }
  });

  assert.equal(result.status, 503);
  assert.equal(result.response.success, false);
  assert.equal(result.response.success ? "" : result.response.code, "storage_error");
  assert.doesNotMatch(result.response.message, /database secret detail/i);
});

test("email failure keeps the accepted inquiry and marks failed status", async () => {
  const { storage, updates } = createStorage();
  const { mailer } = createMailer({ ownerFails: true });

  const result = await submitBookingInquiry(validPayload(), {
    storage,
    mailer,
    now: () => now,
    logger: { warn() {}, error() {} }
  });

  assert.equal(result.status, 201);
  assert.equal(result.response.success, true);
  assert.deepEqual(
    updates.map(({ field, status }) => `${field}:${status}`),
    ["owner_email_status:failed", "customer_email_status:sent"]
  );
});

test("honeypot submissions are rejected without revealing the mechanism", async () => {
  const result = await submitBookingInquiry(validPayload({ companyWebsite: "https://example.com" }), {
    storage: createStorage().storage,
    mailer: createMailer().mailer,
    now: () => now
  });

  assert.equal(result.status, 400);
  assert.equal(result.response.success, false);
  assert.equal(result.response.success ? "" : result.response.code, "abuse_rejected");
  assert.doesNotMatch(result.response.message, /honeypot|bot|company website/i);
});

test("date-only event values remain unchanged for storage and email input", async () => {
  let storedDate = "";
  const { storage } = createStorage({
    onInsert(input) {
      storedDate = input.record.eventDate;
    }
  });
  const { mailer, attempts } = createMailer();

  await submitBookingInquiry(validPayload({ eventDate: "2026-12-05" }), {
    storage,
    mailer,
    now: () => now
  });

  assert.equal(storedDate, "2026-12-05");
  assert.deepEqual(
    attempts.map((attempt) => attempt.eventDate),
    ["2026-12-05", "2026-12-05"]
  );
});

test("submission fingerprint normalizes duplicate identity fields", () => {
  const first = {
    ...validPayload(),
    email: "Avery@Example.com",
    phone: "(804) 555-0199"
  };
  const second = {
    ...validPayload(),
    email: "avery@example.com",
    phone: "804.555.0199"
  };

  const firstResult = createSubmissionFingerprint({
    ...first,
    estimatedGuestCount: 36,
    inquiryStatus: "new",
    depositStatus: "not_requested",
    squareCheckoutReference: null,
    squarePaymentReference: null,
    createdAt: now.toISOString()
  } as BookingInquiryRecord);
  const secondResult = createSubmissionFingerprint({
    ...second,
    estimatedGuestCount: 36,
    inquiryStatus: "new",
    depositStatus: "not_requested",
    squareCheckoutReference: null,
    squarePaymentReference: null,
    createdAt: now.toISOString()
  } as BookingInquiryRecord);

  assert.equal(firstResult, secondResult);
});
