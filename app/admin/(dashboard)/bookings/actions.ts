"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { isBookingAdminWritableStatus } from "@/lib/admin/booking-status";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateBookingStatusAction(formData: FormData) {
  const context = await requireAdminPermission("bookings:update");
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!bookingId || !isBookingAdminWritableStatus(status)) {
    redirect(`/admin/bookings/${bookingId || ""}?error=invalid-status`);
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    redirect(`/admin/bookings/${bookingId}?error=config`);
  }

  const { data: existing, error: lookupError } = await admin
    .from("bookings")
    .select("id, status")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", bookingId)
    .maybeSingle();

  if (lookupError || !existing) {
    redirect("/admin/bookings?error=not-found");
  }

  const { error: updateError } = await admin
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", bookingId)
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID);

  if (updateError) {
    redirect(`/admin/bookings/${bookingId}?error=update-failed`);
  }

  await admin.from("booking_status_history").insert({
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    booking_id: bookingId,
    old_status: existing.status,
    new_status: status,
    changed_by: context.userId,
    reason: reason || null
  });

  if (reason) {
    await admin.from("admin_notes").insert({
      workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
      booking_id: bookingId,
      author_id: context.userId,
      body: reason
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  redirect(`/admin/bookings/${bookingId}`);
}

export async function addBookingNoteAction(formData: FormData) {
  const context = await requireAdminPermission("bookings:update");
  const bookingId = String(formData.get("bookingId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!bookingId || !body) {
    redirect(`/admin/bookings/${bookingId || ""}?error=empty-note`);
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    redirect(`/admin/bookings/${bookingId}?error=config`);
  }

  const { data: existing, error: lookupError } = await admin
    .from("bookings")
    .select("id")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .eq("id", bookingId)
    .maybeSingle();

  if (lookupError || !existing) {
    redirect("/admin/bookings?error=not-found");
  }

  const { error } = await admin.from("admin_notes").insert({
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    booking_id: bookingId,
    author_id: context.userId,
    body
  });

  if (error) {
    redirect(`/admin/bookings/${bookingId}?error=note-failed`);
  }

  revalidatePath(`/admin/bookings/${bookingId}`);
  redirect(`/admin/bookings/${bookingId}`);
}
