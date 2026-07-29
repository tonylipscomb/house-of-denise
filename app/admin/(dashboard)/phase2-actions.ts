"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { createCalendarBlock, deleteCalendarBlock } from "@/lib/admin/calendar";
import { addCustomerNote } from "@/lib/admin/customers";
import {
  saveCatalogExperience,
  saveCatalogPackage,
  saveCatalogUpgrade
} from "@/lib/admin/catalog-admin";

export async function blockCalendarDateAction(formData: FormData) {
  const context = await requireAdminPermission("calendar:manage");
  const blockDate = String(formData.get("blockDate") ?? "");
  const title = String(formData.get("title") ?? "Blocked").trim() || "Blocked";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(blockDate)) {
    redirect("/admin/calendar?error=invalid-date");
  }

  await createCalendarBlock({
    title,
    blockDate,
    notes,
    actorUserId: context.userId
  });

  revalidatePath("/admin/calendar");
  redirect(`/admin/calendar?anchor=${blockDate}&status=blocked`);
}

export async function deleteCalendarBlockAction(formData: FormData) {
  await requireAdminPermission("calendar:manage");
  const id = String(formData.get("id") ?? "");
  const anchor = String(formData.get("anchor") ?? "");
  if (!id) redirect("/admin/calendar?error=missing-block");
  await deleteCalendarBlock(id);
  revalidatePath("/admin/calendar");
  redirect(`/admin/calendar?anchor=${anchor}&status=unblocked`);
}

export async function addCustomerNoteAction(formData: FormData) {
  const context = await requireAdminPermission("customers:view");
  const email = String(formData.get("email") ?? "");
  const body = String(formData.get("body") ?? "");
  await addCustomerNote({
    email,
    body,
    actorUserId: context.userId
  });
  revalidatePath(`/admin/customers/${encodeURIComponent(email)}`);
  redirect(`/admin/customers/${encodeURIComponent(email)}?status=note-saved`);
}

export async function savePackageAction(formData: FormData) {
  await requireAdminPermission("packages:manage");
  const priceRaw = String(formData.get("priceCents") ?? "").trim();
  await saveCatalogPackage({
    id: String(formData.get("id") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceCents: priceRaw === "" ? null : Math.round(Number(priceRaw)),
    guestAllowance: Number(formData.get("guestAllowance") ?? 0),
    fragranceOptions: Number(formData.get("fragranceOptions") ?? 0),
    features: String(formData.get("features") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    mostPopular: formData.get("mostPopular") === "on",
    requiresManualApproval: formData.get("requiresManualApproval") === "on",
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0)
  });
  revalidatePath("/admin/packages");
  revalidatePath("/booking");
  redirect("/admin/packages?status=package-saved");
}

export async function saveUpgradeAction(formData: FormData) {
  await requireAdminPermission("packages:manage");
  const pricingType = String(formData.get("pricingType") ?? "flat") as
    | "flat"
    | "per_guest"
    | "per_hour"
    | "quote";
  const priceRaw = String(formData.get("priceCents") ?? "").trim();
  await saveCatalogUpgrade({
    id: String(formData.get("id") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    pricingType,
    priceCents: priceRaw === "" ? null : Math.round(Number(priceRaw)),
    allowQuantity: formData.get("allowQuantity") === "on",
    maxQuantity: Number(formData.get("maxQuantity") ?? 1),
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0)
  });
  revalidatePath("/admin/packages");
  revalidatePath("/booking");
  redirect("/admin/packages?status=upgrade-saved");
}

export async function saveExperienceCatalogAction(formData: FormData) {
  await requireAdminPermission("experiences:manage");
  await saveCatalogExperience({
    id: String(formData.get("id") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    imageSrc: String(formData.get("imageSrc") ?? "").trim(),
    imageAlt: String(formData.get("imageAlt") ?? "").trim(),
    startingPriceCents: Math.round(Number(formData.get("startingPriceCents") ?? 0)),
    durationLabel: String(formData.get("durationLabel") ?? "").trim(),
    guestRangeLabel: String(formData.get("guestRangeLabel") ?? "").trim(),
    minGuests: Number(formData.get("minGuests") ?? 1),
    maxGuests: Number(formData.get("maxGuests") ?? 50),
    durationMinutes: Number(formData.get("durationMinutes") ?? 120),
    depositPercent: Number(formData.get("depositPercent") ?? 30),
    serviceFeeCents: Math.round(Number(formData.get("serviceFeeCents") ?? 0)),
    mostPopular: formData.get("mostPopular") === "on",
    packageIds: String(formData.get("packageIds") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    upgradeIds: String(formData.get("upgradeIds") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    sortOrder: Number(formData.get("sortOrder") ?? 0)
  });
  revalidatePath("/admin/experiences");
  revalidatePath("/booking");
  redirect("/admin/experiences?status=saved");
}
