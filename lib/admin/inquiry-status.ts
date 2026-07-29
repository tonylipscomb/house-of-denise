/**
 * Inquiry workflow statuses for House of Denise admin.
 *
 * Legacy DB values: new | reviewing | followed-up | closed
 * Expanded (Phase 1 migration): contacted | consultation_scheduled |
 * proposal_sent | converted
 *
 * Existing rows are never rewritten by this mapping.
 */

export const INQUIRY_DB_STATUSES = [
  "new",
  "reviewing",
  "followed-up",
  "closed",
  "contacted",
  "consultation_scheduled",
  "proposal_sent",
  "converted"
] as const;

export type InquiryDbStatus = (typeof INQUIRY_DB_STATUSES)[number];

export const INQUIRY_WORKFLOW_STATUSES = [
  "new",
  "contacted",
  "consultation_scheduled",
  "proposal_sent",
  "converted",
  "closed"
] as const;

export type InquiryWorkflowStatus = (typeof INQUIRY_WORKFLOW_STATUSES)[number];

const LEGACY_TO_WORKFLOW: Record<string, InquiryWorkflowStatus> = {
  new: "new",
  reviewing: "contacted",
  "followed-up": "proposal_sent",
  closed: "closed",
  contacted: "contacted",
  consultation_scheduled: "consultation_scheduled",
  proposal_sent: "proposal_sent",
  converted: "converted"
};

const LABELS: Record<InquiryWorkflowStatus, string> = {
  new: "New",
  contacted: "Contacted",
  consultation_scheduled: "Consultation scheduled",
  proposal_sent: "Proposal sent",
  converted: "Converted",
  closed: "Closed"
};

export function toWorkflowInquiryStatus(
  dbStatus: string,
  convertedBookingId?: string | null
): InquiryWorkflowStatus {
  if (convertedBookingId) return "converted";
  return LEGACY_TO_WORKFLOW[dbStatus] ?? "new";
}

export function inquiryStatusLabel(
  dbStatus: string,
  convertedBookingId?: string | null
): string {
  return LABELS[toWorkflowInquiryStatus(dbStatus, convertedBookingId)];
}

export function isInquiryDbStatus(value: string): value is InquiryDbStatus {
  return (INQUIRY_DB_STATUSES as readonly string[]).includes(value);
}

export function isInquiryWorkflowStatus(
  value: string
): value is InquiryWorkflowStatus {
  return (INQUIRY_WORKFLOW_STATUSES as readonly string[]).includes(value);
}

export type InquiryTone = "neutral" | "info" | "success" | "warning" | "danger";

export function inquiryStatusTone(
  dbStatus: string,
  convertedBookingId?: string | null
): InquiryTone {
  switch (toWorkflowInquiryStatus(dbStatus, convertedBookingId)) {
    case "new":
      return "warning";
    case "contacted":
    case "consultation_scheduled":
    case "proposal_sent":
      return "info";
    case "converted":
      return "success";
    case "closed":
      return "neutral";
    default:
      return "neutral";
  }
}
