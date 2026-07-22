"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";

export async function updateProfileAction(formData: FormData) {
  const context = await requireWorkspaceMembership(undefined, "/account/profile");
  const admin = getSupabaseAdminClient();
  if (!admin) redirect("/account/profile?status=missing-config");

  const fullName = String(formData.get("fullName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const marketingConsent = formData.get("marketingConsent") === "on";

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      marketing_consent: marketingConsent
    })
    .eq("id", context.userId);

  if (error) redirect("/account/profile?status=error");

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect("/account/profile?status=updated");
}
