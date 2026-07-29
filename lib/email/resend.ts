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
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  cachedResend ??= new Resend(apiKey);
  return cachedResend;
}

export function getMissingEmailConfigKeys() {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
  if (!process.env.BOOKING_FROM_EMAIL?.trim()) missing.push("BOOKING_FROM_EMAIL");
  if (!process.env.BOOKING_NOTIFICATION_EMAIL?.trim()) {
    missing.push("BOOKING_NOTIFICATION_EMAIL");
  }
  return missing;
}

export function getBookingEmailConfig() {
  const from = process.env.BOOKING_FROM_EMAIL?.trim();
  const notificationEmail = process.env.BOOKING_NOTIFICATION_EMAIL?.trim();
  const replyTo =
    process.env.BOOKING_REPLY_TO_EMAIL?.trim() || "info@houseofdenise.com";

  const missing = getMissingEmailConfigKeys();
  if (missing.length > 0 || !from || !notificationEmail) {
    throw new EmailConfigurationError(
      `Booking email is not configured. Missing: ${(missing.length
        ? missing
        : ["BOOKING_FROM_EMAIL", "BOOKING_NOTIFICATION_EMAIL"]
      ).join(", ")}.`
    );
  }

  return {
    from,
    notificationEmail,
    replyTo
  };
}
