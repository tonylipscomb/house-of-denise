"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/launchpoint/auth";
import { parseServiceForm, parseVariantForm } from "@/lib/launchpoint/validation";

export async function saveServiceAction(formData: FormData) {
  const context = await requireAdmin();
  const admin = getSupabaseAdminClient();
  if (!admin) redirect("/admin/services?status=missing-config");

  const service = parseServiceForm(formData);
  if (!service.ok) redirect("/admin/services?status=invalid-service");

  const id = String(formData.get("id") ?? "");
  const payload = {
    workspace_id: context.workspace.id,
    slug: service.value.slug,
    name: service.value.name,
    category: service.value.category,
    short_description: service.value.shortDescription,
    description: service.value.description,
    booking_mode: service.value.bookingMode,
    active: service.value.active,
    featured: service.value.featured,
    image_url: service.value.imageUrl,
    sort_order: service.value.sortOrder
  };

  const result = id
    ? await admin.from("services").update(payload).eq("id", id).eq("workspace_id", context.workspace.id).select("id").single()
    : await admin.from("services").insert(payload).select("id").single();

  if (result.error || !result.data) redirect("/admin/services?status=save-error");

  revalidatePath("/admin");
  revalidatePath("/admin/services");
  redirect(`/admin/services/${result.data.id}?status=saved`);
}

export async function deactivateServiceAction(formData: FormData) {
  const context = await requireAdmin();
  const admin = getSupabaseAdminClient();
  if (!admin) redirect("/admin/services?status=missing-config");

  const id = String(formData.get("id") ?? "");
  await admin.from("services").update({ active: false }).eq("id", id).eq("workspace_id", context.workspace.id);
  revalidatePath("/admin/services");
  redirect("/admin/services?status=deactivated");
}

export async function saveVariantAction(formData: FormData) {
  const context = await requireAdmin();
  const admin = getSupabaseAdminClient();
  if (!admin) redirect("/admin/services?status=missing-config");

  const serviceId = String(formData.get("serviceId") ?? "");
  const variantId = String(formData.get("variantId") ?? "");
  const variant = parseVariantForm(formData);
  if (!variant.ok) redirect(`/admin/services/${serviceId}?status=invalid-variant`);

  const { data: service } = await admin
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .eq("workspace_id", context.workspace.id)
    .maybeSingle();

  if (!service) redirect("/admin/services?status=missing-service");

  const payload = {
    workspace_id: context.workspace.id,
    service_id: serviceId,
    name: variant.value.name,
    active: variant.value.active,
    duration_minutes: variant.value.durationMinutes,
    setup_minutes: variant.value.setupMinutes,
    cleanup_minutes: variant.value.cleanupMinutes,
    travel_buffer_minutes: variant.value.travelBufferMinutes,
    minimum_guest_count: variant.value.minimumGuestCount,
    maximum_guest_count: variant.value.maximumGuestCount,
    minimum_notice_hours: variant.value.minimumNoticeHours,
    maximum_advance_days: variant.value.maximumAdvanceDays,
    price_amount: variant.value.priceAmount,
    deposit_amount: variant.value.depositAmount,
    deposit_percentage: variant.value.depositPercentage,
    currency: variant.value.currency,
    sort_order: variant.value.sortOrder
  };

  const result = variantId
    ? await admin.from("service_variants").update(payload).eq("id", variantId).eq("workspace_id", context.workspace.id)
    : await admin.from("service_variants").insert(payload);

  if (result.error) redirect(`/admin/services/${serviceId}?status=variant-error`);
  revalidatePath(`/admin/services/${serviceId}`);
  redirect(`/admin/services/${serviceId}?status=variant-saved`);
}
