import "server-only";

import {
  EmailConfigurationError,
  getBookingEmailConfig,
  getResendClient
} from "@/lib/email/resend";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dollars(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
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

async function sendOrThrow(input: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}) {
  const resend = getResendClient();
  if (!resend) throw new EmailConfigurationError();

  const { error } = await resend.emails.send(input);
  if (error) {
    throw new Error(error.message || "Resend failed to send email.");
  }
}

export type BookingPaymentEmailInput = {
  referenceNumber: string;
  guestName: string | null;
  guestEmail: string;
  eventDate: string | null;
  amountPaidCents: number;
  remainingBalanceCents: number;
  paymentStatus: string;
};

export async function sendCustomerBookingPaymentConfirmation(
  input: BookingPaymentEmailInput
) {
  const config = getBookingEmailConfig();
  const first = input.guestName?.trim().split(/\s+/)[0] || "there";
  const isDeposit = input.remainingBalanceCents > 0;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://houseofdenise.com";
  const subject = isDeposit
    ? `Deposit received — ${input.referenceNumber}`
    : `Payment received — ${input.referenceNumber}`;

  await sendOrThrow({
    from: config.from,
    to: input.guestEmail,
    replyTo: config.replyTo,
    subject,
    text: `Hi ${first},

Thank you. We received your ${isDeposit ? "deposit" : "payment"} for booking ${input.referenceNumber}.

Amount paid: ${dollars(input.amountPaidCents)}
${isDeposit ? `Remaining balance: ${dollars(input.remainingBalanceCents)}\n` : ""}${
      input.eventDate ? `Event date: ${input.eventDate}\n` : ""
    }
View booking: ${site}/booking/confirmation?reference=${encodeURIComponent(input.referenceNumber)}

Questions: ${config.replyTo}`,
    html: shell(
      isDeposit ? "Your deposit is received." : "Your payment is received.",
      `<p style="margin:0 0 16px;line-height:1.6;">Thank you, ${escapeHtml(first)}. We received your ${
        isDeposit ? "deposit" : "payment"
      } for booking <strong>${escapeHtml(input.referenceNumber)}</strong>.</p>
      <p style="margin:0 0 8px;line-height:1.6;"><strong>Amount paid:</strong> ${escapeHtml(
        dollars(input.amountPaidCents)
      )}</p>
      ${
        isDeposit
          ? `<p style="margin:0 0 8px;line-height:1.6;"><strong>Remaining balance:</strong> ${escapeHtml(
              dollars(input.remainingBalanceCents)
            )}</p>`
          : ""
      }
      ${
        input.eventDate
          ? `<p style="margin:0 0 16px;line-height:1.6;"><strong>Event date:</strong> ${escapeHtml(
              input.eventDate
            )}</p>`
          : ""
      }
      <p style="margin:0 0 16px;"><a href="${escapeHtml(
        site
      )}/booking/confirmation?reference=${encodeURIComponent(
        input.referenceNumber
      )}" style="color:#7a5b2f;font-weight:700;">View booking details</a></p>
      <p style="margin:0;color:#6f6259;line-height:1.6;">Questions: ${escapeHtml(config.replyTo)}</p>`
    )
  });
}

export async function sendOwnerBookingPaymentNotification(
  input: BookingPaymentEmailInput
) {
  const config = getBookingEmailConfig();
  const isDeposit = input.remainingBalanceCents > 0;

  await sendOrThrow({
    from: config.from,
    to: config.notificationEmail,
    replyTo: input.guestEmail,
    subject: `${isDeposit ? "Deposit" : "Payment"} received — ${input.referenceNumber}`,
    text: `Booking payment update

Reference: ${input.referenceNumber}
Guest: ${input.guestName || "Not provided"}
Email: ${input.guestEmail}
Event date: ${input.eventDate || "Not provided"}
Amount paid: ${dollars(input.amountPaidCents)}
Remaining balance: ${dollars(input.remainingBalanceCents)}
Payment status: ${input.paymentStatus}`,
    html: shell(
      isDeposit ? "Deposit received" : "Payment received",
      `<table role="presentation" style="width:100%;border-collapse:collapse;">
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Reference</th><td style="padding:8px 0;">${escapeHtml(input.referenceNumber)}</td></tr>
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Guest</th><td style="padding:8px 0;">${escapeHtml(input.guestName || "Not provided")}</td></tr>
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Email</th><td style="padding:8px 0;">${escapeHtml(input.guestEmail)}</td></tr>
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Event date</th><td style="padding:8px 0;">${escapeHtml(input.eventDate || "Not provided")}</td></tr>
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Amount paid</th><td style="padding:8px 0;">${escapeHtml(dollars(input.amountPaidCents))}</td></tr>
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Remaining</th><td style="padding:8px 0;">${escapeHtml(dollars(input.remainingBalanceCents))}</td></tr>
        <tr><th align="left" style="padding:8px 12px 8px 0;color:#6f6259;font-size:13px;">Status</th><td style="padding:8px 0;">${escapeHtml(input.paymentStatus)}</td></tr>
      </table>`
    )
  });
}
