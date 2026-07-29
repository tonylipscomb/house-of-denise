import "server-only";

import type { BookingInquiryRecord } from "../../data/booking.ts";
import { EmailConfigurationError, getBookingEmailConfig, getResendClient } from "./resend.ts";

export type BookingEmailInput = {
  referenceNumber: string;
  record: BookingInquiryRecord;
  createdAt: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function display(value: string | number | null | undefined) {
  if (typeof value === "number") return `${value}`;
  return value ? value : "Not provided";
}

function formatSubmissionDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York"
  }).format(new Date(iso));
}

function detailRows(rows: Array<[string, string | number | null | undefined]>) {
  return rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">${escapeHtml(
          label
        )}</th><td style="padding:8px 0;color:#241812;">${escapeHtml(display(value))}</td></tr>`
    )
    .join("");
}

function textRows(rows: Array<[string, string | number | null | undefined]>) {
  return rows.map(([label, value]) => `${label}: ${display(value)}`).join("\n");
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f3ec;color:#241812;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <div style="border:1px solid #dfd2c5;background:#fffaf4;padding:28px;">
        <p style="margin:0 0 12px;color:#7a5b2f;font-size:12px;letter-spacing:1px;text-transform:uppercase;">House Of Denise</p>
        <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#241812;">${escapeHtml(
          title
        )}</h1>
        ${body}
      </div>
    </div>
  </body>
</html>`;
}

export async function sendOwnerBookingNotification(input: BookingEmailInput) {
  const resend = getResendClient();
  if (!resend) throw new EmailConfigurationError();

  const config = getBookingEmailConfig();
  const { record, referenceNumber, createdAt } = input;
  const subject = `New House Of Denise inquiry - ${record.eventType} - ${record.eventDate}`;
  const rows: Array<[string, string | number | null | undefined]> = [
    ["Inquiry reference", referenceNumber],
    ["Submission date", formatSubmissionDate(createdAt)],
    ["Full name", record.fullName],
    ["Email", record.email],
    ["Phone", record.phone],
    ["Preferred contact method", record.preferredContactMethod],
    ["Event type", record.eventType],
    ["Event date", record.eventDate],
    ["Start time", record.startTime],
    ["Venue", record.venueName],
    ["City and state", `${record.eventCity}, ${record.eventState}`],
    ["Estimated guest count", record.estimatedGuestCount],
    ["Selected experience", record.experienceFormat],
    ["Event description", record.eventVision],
    ["Special requests", record.specialRequests],
    ["Referral source", record.referralSource],
    ["Inquiry status", record.inquiryStatus],
    ["Deposit status", record.depositStatus]
  ];

  const { error } = await resend.emails.send({
    from: config.from,
    to: config.notificationEmail,
    replyTo: record.email,
    subject,
    text: `${subject}

This is an inquiry only. Availability and booking confirmation still require review.

${textRows(rows)}`,
    html: shell(
      "New booking inquiry",
      `<p style="margin:0 0 18px;line-height:1.6;">This is an inquiry only. Availability and booking confirmation still require review.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">${detailRows(rows)}</table>`
    )
  });
  if (error) throw new Error(error.message || "Resend failed to send owner inquiry email.");
}

export async function sendCustomerBookingConfirmation(input: BookingEmailInput) {
  const resend = getResendClient();
  if (!resend) throw new EmailConfigurationError();

  const config = getBookingEmailConfig();
  const { record, referenceNumber } = input;
  const rows: Array<[string, string | number | null | undefined]> = [
    ["Inquiry reference", referenceNumber],
    ["Event type", record.eventType],
    ["Event date", record.eventDate],
    ["Estimated guest count", record.estimatedGuestCount],
    ["Selected experience", record.experienceFormat]
  ];

  const { error } = await resend.emails.send({
    from: config.from,
    to: record.email,
    replyTo: config.replyTo,
    subject: "We received your House Of Denise inquiry",
    text: `Your inquiry has been received.

Thank you for considering House Of Denise. Your event details were received and will be reviewed. House Of Denise will follow up regarding availability, planning, and deposit details after review.

Submitting an inquiry does not reserve your date or confirm availability.

${textRows(rows)}

Questions: info@houseofdenise.com or 804-850-4222`,
    html: shell(
      "Your inquiry has been received.",
      `<p style="margin:0 0 16px;line-height:1.6;">Thank you for considering House Of Denise. Your event details were received and will be reviewed. House Of Denise will follow up regarding availability, planning, and deposit details after review.</p>
      <p style="margin:0 0 18px;line-height:1.6;font-weight:700;">Submitting an inquiry does not reserve your date or confirm availability.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:18px;">${detailRows(rows)}</table>
      <p style="margin:0;color:#6f6259;line-height:1.6;">Questions: info@houseofdenise.com or 804-850-4222</p>`
    )
  });
  if (error) throw new Error(error.message || "Resend failed to send customer inquiry email.");
}
