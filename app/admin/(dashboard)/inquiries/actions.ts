"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { updateInquiryStatus } from "@/lib/admin/inquiries";
import { isInquiryDbStatus } from "@/lib/admin/inquiry-status";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateInquiryStatusAction(formData: FormData) {
  const context = await requireAdminPermission("inquiries:update");
  const inquiryId = String(formData.get("inquiryId") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!inquiryId || !isInquiryDbStatus(status)) {
    redirect(`/admin/inquiries/${inquiryId || ""}?error=invalid-status`);
  }

  await updateInquiryStatus({
    inquiryId,
    status,
    actorUserId: context.userId
  });

  if (note) {
    const admin = getSupabaseAdminClient();
    if (admin) {
      await admin.from("admin_notes").insert({
        workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
        booking_inquiry_id: inquiryId,
        author_id: context.userId,
        body: note
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  redirect(`/admin/inquiries/${inquiryId}`);
}
