export const eventTypeOptions = [
  "Birthday",
  "Bridal Shower",
  "Wedding",
  "Corporate Event",
  "Private Party",
  "Baby Shower",
  "Celebration or Milestone",
  "Other"
] as const;

export const experienceFormatOptions = [
  "Private Fragrance Experience",
  "Wedding or Large Event Experience",
  "Corporate Fragrance Experience",
  "Not Sure Yet"
] as const;

export const contactMethodOptions = ["Email", "Phone", "Text", "No Preference"] as const;

export const referralSourceOptions = [
  "Instagram",
  "Facebook",
  "Google Search",
  "Friend or Family",
  "Event or Workshop",
  "Returning Customer",
  "Other"
] as const;

export type EventType = (typeof eventTypeOptions)[number];
export type ExperienceFormat = (typeof experienceFormatOptions)[number];
export type ContactMethod = (typeof contactMethodOptions)[number];
export type ReferralSource = (typeof referralSourceOptions)[number];

export type ContactDetails = {
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod: ContactMethod | "";
};

export type EventDetails = {
  eventType: EventType | "";
  eventDate: string;
  startTime: string;
  eventCity: string;
  eventState: string;
  venueName: string;
  estimatedGuestCount: string;
};

export type ExperiencePreferences = {
  experienceFormat: ExperienceFormat | "";
  eventVision: string;
  specialRequests: string;
  referralSource: ReferralSource | "";
};

export type BookingInquiryFormData = ContactDetails &
  EventDetails &
  ExperiencePreferences & {
    consent: boolean;
  };

export type BookingInquirySubmissionPayload = BookingInquiryFormData & {
  companyWebsite?: string;
  formStartedAt?: string;
};

export type BookingInquiryRecord = Omit<BookingInquiryFormData, "estimatedGuestCount"> & {
  estimatedGuestCount: number;
  inquiryStatus: "new" | "reviewing" | "followed-up" | "closed";
  depositStatus: "not_requested" | "pending" | "paid" | "waived";
  squareCheckoutReference: string | null;
  squarePaymentReference: string | null;
  createdAt: string;
};

export type BookingValidationErrors = Partial<Record<keyof BookingInquiryFormData, string>>;

export type BookingSubmissionResponse =
  | {
      success: true;
      referenceNumber: string;
      status: BookingInquiryRecord["inquiryStatus"];
      depositStatus: BookingInquiryRecord["depositStatus"];
      createdAt: string;
      message: string;
    }
  | {
      success: false;
      code: "validation_error" | "storage_error" | "abuse_rejected";
      errors: BookingValidationErrors;
      message: string;
    };

export const emptyBookingInquiry: BookingInquiryFormData = {
  fullName: "",
  email: "",
  phone: "",
  preferredContactMethod: "",
  eventType: "",
  eventDate: "",
  startTime: "",
  eventCity: "",
  eventState: "",
  venueName: "",
  estimatedGuestCount: "",
  experienceFormat: "",
  eventVision: "",
  specialRequests: "",
  referralSource: "",
  consent: false
};

export const bookingFieldLimits = {
  fullName: 120,
  email: 160,
  phone: 30,
  eventCity: 80,
  eventState: 40,
  venueName: 160,
  eventVision: 1200,
  specialRequests: 800
} as const;

export const bookingEmailPreparation = {
  envVarsNeededLater: ["RESEND_API_KEY", "BOOKING_NOTIFICATION_EMAIL", "BOOKING_FROM_EMAIL", "BOOKING_REPLY_TO_EMAIL"],
  ownerNotification:
    "Send House Of Denise a new inquiry notification with contact details, event date, event type, guest count, selected experience format, location, and event notes.",
  customerConfirmation:
    "Send the customer a confirmation that the inquiry was received for review, without claiming that availability, date reservation, or payment is confirmed."
} as const;

export const bookingSquarePreparation = {
  envVarsNeededLater: ["SQUARE_ACCESS_TOKEN", "SQUARE_LOCATION_ID", "SQUARE_ENVIRONMENT", "SQUARE_WEBHOOK_SIGNATURE_KEY"],
  plannedFields: ["inquiryStatus", "depositStatus", "squareCheckoutReference", "squarePaymentReference", "createdAt"],
  note: "Square deposit checkout should be connected only after inquiry storage and email notifications are reliable."
} as const;
