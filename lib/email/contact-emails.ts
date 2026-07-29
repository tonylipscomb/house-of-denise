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

export type ContactMessageInput = {
  name: string;
  email: string;
  message: string;
};

export async function sendOwnerContactNotification(input: ContactMessageInput) {
  const config = getBookingEmailConfig();
  const subject = `New contact message from ${input.name}`;

  await sendOrThrow({
    from: config.from,
    to: config.notificationEmail,
    replyTo: input.email,
    subject,
    text: `${subject}

Name: ${input.name}
Email: ${input.email}

Message:
${input.message}`,
    html: shell(
      "New contact message",
      `<p style="margin:0 0 12px;line-height:1.6;"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin:0 0 12px;line-height:1.6;"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:0 0 8px;color:#6f6259;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;">Message</p>
      <p style="margin:0;line-height:1.7;white-space:pre-wrap;">${escapeHtml(input.message)}</p>`
    )
  });
}

export async function sendCustomerContactAcknowledgement(
  input: ContactMessageInput
) {
  const config = getBookingEmailConfig();
  const first = input.name.trim().split(/\s+/)[0] || "there";

  await sendOrThrow({
    from: config.from,
    to: input.email,
    replyTo: config.replyTo,
    subject: "We received your message — House Of Denise",
    text: `Hi ${first},

Thank you for reaching out to House Of Denise. We received your message and will respond shortly.

Questions: ${config.replyTo}`,
    html: shell(
      `Thank you, ${first}.`,
      `<p style="margin:0 0 16px;line-height:1.6;">We received your message and will respond with care shortly.</p>
      <p style="margin:0;color:#6f6259;line-height:1.6;">Questions: ${escapeHtml(config.replyTo)}</p>`
    )
  });
}
