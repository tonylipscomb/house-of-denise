import "server-only";

import { Resend } from "resend";

let cachedResend: Resend | null = null;

export class EmailConfigurationError extends Error {
  constructor(message = "Booking email is not configured.") {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  cachedResend ??= new Resend(apiKey);
  return cachedResend;
}

export function getBookingEmailConfig() {
  const from = process.env.BOOKING_FROM_EMAIL;
  const notificationEmail = process.env.BOOKING_NOTIFICATION_EMAIL;
  const replyTo = process.env.BOOKING_REPLY_TO_EMAIL || "info@houseofdenise.com";

  if (!from || !notificationEmail) {
    throw new EmailConfigurationError();
  }

  return {
    from,
    notificationEmail,
    replyTo
  };
}
