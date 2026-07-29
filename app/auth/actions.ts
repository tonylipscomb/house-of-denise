"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ensureHouseOfDeniseCustomer,
  requireAuthenticatedUser
} from "@/lib/launchpoint/auth";
import { claimBookingsForVerifiedEmail } from "@/lib/booking-wizard/claim-bookings";
import { sendCustomerWelcomeEmail } from "@/lib/email/customer-emails";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/account");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function registerRedirect(status: string, next?: string) {
  const params = new URLSearchParams({ status });
  if (next) params.set("next", next);
  redirect(`/register?${params.toString()}`);
}

async function claimAfterAuth(
  userId: string,
  email: string | null | undefined,
  formData: FormData
) {
  const reference = String(formData.get("bookingReference") ?? "").trim() || null;
  await claimBookingsForVerifiedEmail({
    userId,
    email,
    referenceNumber: reference
  });
}

function isExistingUserError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already") ||
    normalized.includes("registered") ||
    normalized.includes("exists")
  );
}

export async function registerAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) {
    registerRedirect("missing-config");
    return;
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const next = getSafeNext(formData);

  if (!email || !email.includes("@")) {
    registerRedirect("invalid-email", next);
    return;
  }
  if (password.length < 8) {
    registerRedirect("weak-password", next);
    return;
  }
  if (!fullName) {
    registerRedirect("missing-name", next);
    return;
  }

  /*
   * Create the auth user with the service role and mark email confirmed.
   * This avoids Supabase's built-in confirmation-mail rate limits for signup.
   * Auth magic-link / reset emails still use Supabase mail (configure Resend SMTP).
   */
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  const newUser = created.data.user;
  if (created.error || !newUser) {
    const message = created.error?.message ?? "Unable to create account.";
    if (isExistingUserError(message)) {
      registerRedirect("exists", next);
      return;
    }
    if (message.toLowerCase().includes("rate limit")) {
      registerRedirect("rate-limit", next);
      return;
    }
    console.error("[register] createUser failed", {
      message,
      code: created.error?.code ?? null
    });
    registerRedirect("error", next);
    return;
  }

  try {
    await ensureHouseOfDeniseCustomer(
      newUser.id,
      newUser.email ?? email,
      fullName
    );
  } catch (error) {
    console.error("[register] membership ensure failed", {
      message: error instanceof Error ? error.message : "unknown"
    });
  }

  const { data: signedIn, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !signedIn.user) {
    console.error("[register] sign-in after create failed", {
      message: signInError?.message ?? "unknown"
    });
    redirect(`/login?status=created&next=${encodeURIComponent(next)}`);
  }

  await claimAfterAuth(signedIn.user.id, signedIn.user.email ?? email, formData);

  try {
    await sendCustomerWelcomeEmail({
      email: signedIn.user.email ?? email,
      fullName
    });
  } catch (error) {
    console.warn("[register] welcome email skipped", {
      message: error instanceof Error ? error.message : "unknown"
    });
  }

  redirect(next);
}

export async function loginAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?status=missing-config");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);
  const loginPath = next.startsWith("/admin") ? "/admin/login" : "/login";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error || !data.user) {
    redirect(`${loginPath}?status=invalid&next=${encodeURIComponent(next)}`);
  }

  await ensureHouseOfDeniseCustomer(data.user.id, data.user.email ?? email);
  await claimAfterAuth(data.user.id, data.user.email ?? email, formData);
  redirect(next);
}

export async function requestBookingAccessInviteAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const reference = String(formData.get("bookingReference") ?? "").trim();
  const nextPath = reference
    ? `/account/bookings/${encodeURIComponent(reference)}`
    : "/account/bookings";

  if (!supabase || !email) {
    redirect(
      reference
        ? `/booking/confirmation?reference=${encodeURIComponent(reference)}&invite=error`
        : "/login?status=missing-config"
    );
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`
    }
  });

  if (error) {
    console.error("[booking-invite] otp failed", {
      message: error.message,
      code: error.code
    });
  }

  redirect(
    `/booking/confirmation?reference=${encodeURIComponent(reference)}&invite=${
      error ? (error.message.toLowerCase().includes("rate limit") ? "rate-limit" : "error") : "sent"
    }`
  );
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/forgot-password?status=missing-config");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`
  });

  if (error) {
    console.error("[forgot-password] failed", {
      message: error.message,
      code: error.code
    });
    redirect(
      `/forgot-password?status=${
        error.message.toLowerCase().includes("rate limit") ? "rate-limit" : "error"
      }`
    );
  }

  redirect("/forgot-password?status=sent");
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/reset-password?status=missing-config");

  await requireAuthenticatedUser("/reset-password");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect("/reset-password?status=weak-password");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/reset-password?status=error");
  redirect("/account?status=password-updated");
}
