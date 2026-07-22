import {
  bookingFieldLimits,
  contactMethodOptions,
  eventTypeOptions,
  experienceFormatOptions,
  referralSourceOptions,
  type BookingInquiryFormData,
  type BookingInquirySubmissionPayload,
  type BookingInquiryRecord,
  type BookingValidationErrors
} from "../data/booking.ts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneAllowedPattern = /^[0-9+()\-\s.]+$/;

const requiredMessage = "This field is required.";

function valueAsString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function valueAsBoolean(value: unknown) {
  return value === true;
}

function isPastDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return true;
  const selected = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today;
}

function validateMaxLength(
  errors: BookingValidationErrors,
  field: keyof BookingInquiryFormData,
  value: string,
  limit: number
) {
  if (value.length > limit) {
    errors[field] = `Please keep this under ${limit} characters.`;
  }
}

export function normalizeBookingInquiry(input: unknown): BookingInquiryFormData {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  return {
    fullName: valueAsString(raw.fullName),
    email: valueAsString(raw.email).toLowerCase(),
    phone: valueAsString(raw.phone),
    preferredContactMethod: valueAsString(raw.preferredContactMethod) as BookingInquiryFormData["preferredContactMethod"],
    eventType: valueAsString(raw.eventType) as BookingInquiryFormData["eventType"],
    eventDate: valueAsString(raw.eventDate),
    startTime: valueAsString(raw.startTime),
    eventCity: valueAsString(raw.eventCity),
    eventState: valueAsString(raw.eventState),
    venueName: valueAsString(raw.venueName),
    estimatedGuestCount: valueAsString(raw.estimatedGuestCount),
    experienceFormat: valueAsString(raw.experienceFormat) as BookingInquiryFormData["experienceFormat"],
    eventVision: valueAsString(raw.eventVision),
    specialRequests: valueAsString(raw.specialRequests),
    referralSource: valueAsString(raw.referralSource) as BookingInquiryFormData["referralSource"],
    consent: valueAsBoolean(raw.consent)
  };
}

export function normalizeBookingSubmissionPayload(input: unknown): BookingInquirySubmissionPayload {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  return {
    ...normalizeBookingInquiry(input),
    companyWebsite: valueAsString(raw.companyWebsite),
    formStartedAt: valueAsString(raw.formStartedAt)
  };
}

export function validateBookingInquiry(data: BookingInquiryFormData, options: { requireConsent?: boolean } = {}) {
  const errors: BookingValidationErrors = {};
  const requireConsent = options.requireConsent ?? true;

  if (!data.fullName) errors.fullName = requiredMessage;
  if (!data.email) errors.email = requiredMessage;
  if (!data.phone) errors.phone = requiredMessage;
  if (!data.eventType) errors.eventType = requiredMessage;
  if (!data.eventDate) errors.eventDate = requiredMessage;
  if (!data.eventCity) errors.eventCity = requiredMessage;
  if (!data.eventState) errors.eventState = requiredMessage;
  if (!data.estimatedGuestCount) errors.estimatedGuestCount = requiredMessage;

  if (data.email && !emailPattern.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  const phoneDigits = data.phone.replace(/\D/g, "");
  if (data.phone && (!phoneAllowedPattern.test(data.phone) || phoneDigits.length < 7 || phoneDigits.length > 15)) {
    errors.phone = "Enter a valid phone number.";
  }

  if (data.eventType && !eventTypeOptions.includes(data.eventType as (typeof eventTypeOptions)[number])) {
    errors.eventType = "Choose a valid event type.";
  }

  if (
    data.preferredContactMethod &&
    !contactMethodOptions.includes(data.preferredContactMethod as (typeof contactMethodOptions)[number])
  ) {
    errors.preferredContactMethod = "Choose a valid contact method.";
  }

  if (
    data.experienceFormat &&
    !experienceFormatOptions.includes(data.experienceFormat as (typeof experienceFormatOptions)[number])
  ) {
    errors.experienceFormat = "Choose a valid experience format.";
  }

  if (data.referralSource && !referralSourceOptions.includes(data.referralSource as (typeof referralSourceOptions)[number])) {
    errors.referralSource = "Choose a valid referral source.";
  }

  if (data.eventDate && isPastDate(data.eventDate)) {
    errors.eventDate = "Event date cannot be in the past.";
  }

  const guestCount = Number(data.estimatedGuestCount);
  if (data.estimatedGuestCount && (!Number.isInteger(guestCount) || guestCount <= 0)) {
    errors.estimatedGuestCount = "Guest count must be greater than zero.";
  }

  validateMaxLength(errors, "fullName", data.fullName, bookingFieldLimits.fullName);
  validateMaxLength(errors, "email", data.email, bookingFieldLimits.email);
  validateMaxLength(errors, "phone", data.phone, bookingFieldLimits.phone);
  validateMaxLength(errors, "eventCity", data.eventCity, bookingFieldLimits.eventCity);
  validateMaxLength(errors, "eventState", data.eventState, bookingFieldLimits.eventState);
  validateMaxLength(errors, "venueName", data.venueName, bookingFieldLimits.venueName);
  validateMaxLength(errors, "eventVision", data.eventVision, bookingFieldLimits.eventVision);
  validateMaxLength(errors, "specialRequests", data.specialRequests, bookingFieldLimits.specialRequests);

  if (requireConsent && !data.consent) {
    errors.consent = "Please acknowledge that this is an inquiry and does not reserve your date.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function createBookingInquiryRecord(data: BookingInquiryFormData): BookingInquiryRecord {
  return {
    ...data,
    estimatedGuestCount: Number(data.estimatedGuestCount),
    inquiryStatus: "new",
    depositStatus: "not_requested",
    squareCheckoutReference: null,
    squarePaymentReference: null,
    createdAt: new Date().toISOString()
  };
}
