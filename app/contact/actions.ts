"use server";

import { EmailConfigurationError, getMissingEmailConfigKeys } from "@/lib/email/resend";
import {
  sendCustomerContactAcknowledgement,
  sendOwnerContactNotification
} from "@/lib/email/contact-emails";

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string };

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function submitContactAction(
  formData: FormData
): Promise<ContactActionResult> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const message = clean(formData.get("message"));
  const honeypot = clean(formData.get("companyWebsite"));

  if (honeypot) {
    return { ok: true };
  }

  if (!name || !email || !message) {
    return { ok: false, error: "Please complete all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (message.length > 5000) {
    return { ok: false, error: "Please keep your message under 5,000 characters." };
  }

  const missing = getMissingEmailConfigKeys();
  if (missing.length > 0) {
    console.error("[contact] missing email env", { missing });
    return {
      ok: false,
      error:
        process.env.NODE_ENV === "development"
          ? `Email is not configured yet. Add ${missing.join(", ")} to .env.local, then restart the dev server.`
          : "Messaging is temporarily unavailable. Please email info@houseofdenise.com or call 804-850-4222."
    };
  }

  try {
    await sendOwnerContactNotification({ name, email, message });
  } catch (error) {
    console.error("[contact] owner notification failed", {
      message: error instanceof Error ? error.message : "unknown",
      category: error instanceof Error ? error.name : "UnknownEmailError"
    });

    if (error instanceof EmailConfigurationError) {
      return {
        ok: false,
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Messaging is temporarily unavailable. Please email info@houseofdenise.com or call 804-850-4222."
      };
    }

    return {
      ok: false,
      error:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? `Email send failed: ${error.message}`
          : "We could not send your message just now. Please try again, or email info@houseofdenise.com."
    };
  }

  try {
    await sendCustomerContactAcknowledgement({ name, email, message });
  } catch (error) {
    // Owner already got the message — don't fail the form for ack issues.
    console.warn("[contact] customer acknowledgement skipped", {
      message: error instanceof Error ? error.message : "unknown"
    });
  }

  return { ok: true };
}
