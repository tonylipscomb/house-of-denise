import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

/**
 * Only attach a signed-in customer to a booking when their verified auth email
 * matches the booking guest email. Prevents logged-in staff/tests from owning
 * guest checkouts that used a different email.
 */
export function resolveBookingCustomerId(options: {
  authUserId: string | null | undefined;
  authEmail: string | null | undefined;
  guestEmail: string | null | undefined;
}): string | null {
  const authId = options.authUserId?.trim() || null;
  if (!authId) return null;

  const authEmail = normalizeEmail(options.authEmail);
  const guestEmail = normalizeEmail(options.guestEmail);
  if (!authEmail || !guestEmail || authEmail !== guestEmail) {
    return null;
  }

  return authId;
}

/**
 * Claim unowned bookings whose guest_email matches the verified account email.
 * Never steals bookings already owned by another customer.
 */
export async function claimBookingsForVerifiedEmail(options: {
  userId: string;
  email: string | null | undefined;
  referenceNumber?: string | null;
}) {
  const admin = getSupabaseAdminClient();
  const email = normalizeEmail(options.email);
  if (!admin || !email) {
    return { claimed: 0 };
  }

  let query = admin
    .from("bookings")
    .update({
      customer_id: options.userId,
      updated_at: new Date().toISOString()
    })
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .is("customer_id", null)
    .ilike("guest_email", email);

  if (options.referenceNumber?.trim()) {
    query = query.eq("reference_number", options.referenceNumber.trim());
  }

  const { data, error } = await query.select("id");
  if (error) {
    console.error("[booking-claim] failed", { message: error.message });
    return { claimed: 0 };
  }

  return { claimed: data?.length ?? 0 };
}

export async function getCustomerBookingByReference(options: {
  userId: string;
  email: string | null | undefined;
  referenceNumber: string;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const email = normalizeEmail(options.email);
  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("reference_number", options.referenceNumber)
    .maybeSingle();

  if (!data) return null;

  const ownsById = data.customer_id === options.userId;
  const ownsByEmail =
    Boolean(email) && normalizeEmail(data.guest_email) === email;

  if (!ownsById && !ownsByEmail) return null;

  if (!data.customer_id && ownsByEmail) {
    await claimBookingsForVerifiedEmail({
      userId: options.userId,
      email,
      referenceNumber: options.referenceNumber
    });
  }

  return data;
}
