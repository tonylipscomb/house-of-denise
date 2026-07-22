"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureHouseOfDeniseCustomer, requireAuthenticatedUser } from "@/lib/launchpoint/auth";

function getSafeNext(formData: FormData) {
  const next = String(formData.get("next") ?? "/account");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function registerAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/register?status=missing-config");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const next = getSafeNext(formData);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) redirect(`/register?status=error`);
  if (data.user) await ensureHouseOfDeniseCustomer(data.user.id, data.user.email ?? email, fullName);

  redirect(data.session ? next : "/login?status=check-email");
}

export async function loginAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?status=missing-config");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect(`/login?status=invalid&next=${encodeURIComponent(next)}`);

  await ensureHouseOfDeniseCustomer(data.user.id, data.user.email ?? email);
  redirect(next);
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
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`
  });
  redirect("/forgot-password?status=sent");
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/reset-password?status=missing-config");

  await requireAuthenticatedUser("/reset-password");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/reset-password?status=error");
  redirect("/account?status=password-updated");
}
