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

/**
 * Optional welcome email after account creation.
 * Requires RESEND_API_KEY + BOOKING_FROM_EMAIL (+ reply-to).
 * Never throws to callers — registration should succeed without mail.
 */
export async function sendCustomerWelcomeEmail(input: {
  email: string;
  fullName?: string | null;
}) {
  const resend = getResendClient();
  if (!resend) {
    throw new EmailConfigurationError(
      "RESEND_API_KEY is not configured for customer emails."
    );
  }

  let config: ReturnType<typeof getBookingEmailConfig>;
  try {
    config = getBookingEmailConfig();
  } catch {
    throw new EmailConfigurationError(
      "BOOKING_FROM_EMAIL / BOOKING_NOTIFICATION_EMAIL are required for customer emails."
    );
  }

  const first = input.fullName?.trim().split(/\s+/)[0] || "there";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://houseofdenise.com";

  const { error } = await resend.emails.send({
    from: config.from,
    to: input.email,
    replyTo: config.replyTo,
    subject: "Welcome to House Of Denise",
    text: `Welcome, ${first}.

Your House Of Denise account is ready. You can sign in anytime to view bookings and balances.

${site}/account

Questions: ${config.replyTo}`,
    html: shell(
      `Welcome, ${first}.`,
      `<p style="margin:0 0 16px;line-height:1.6;">Your House Of Denise account is ready. Sign in anytime to view bookings, balances, and profile details.</p>
      <p style="margin:0 0 18px;"><a href="${escapeHtml(site)}/account" style="color:#7a5b2f;font-weight:700;">Open my account</a></p>
      <p style="margin:0;color:#6f6259;line-height:1.6;">Questions: ${escapeHtml(config.replyTo)}</p>`
    )
  });
  if (error) throw new Error(error.message || "Resend failed to send welcome email.");
}
