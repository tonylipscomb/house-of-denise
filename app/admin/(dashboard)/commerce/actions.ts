"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { requireCommerceAdmin } from "@/lib/commerce/admin-auth";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("Missing Supabase server configuration.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function moneyToCents(value: string): number {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Price must be a valid nonnegative amount.");
  }

  return Math.round(amount * 100);
}

function positiveInteger(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    return fallback;
  }

  return parsed;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCommerceItem(formData: FormData) {
  await requireCommerceAdmin();

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);

  if (!name || !slug) {
    throw new Error("Name and slug are required.");
  }

  const supabase = adminClient();

  const { error } = await supabase
    .from("commerce_items")
    .insert({
      slug,
      name,
      description: text(formData, "description"),
      item_type: text(formData, "itemType"),
      price_cents: moneyToCents(text(formData, "price")),
      active: formData.get("active") === "on",
      image_url: text(formData, "imageUrl"),
      fulfillment_type: text(formData, "fulfillmentType"),
      square_catalog_variation_id:
        text(formData, "squareCatalogVariationId") || null,
      max_per_order: positiveInteger(
        text(formData, "maxPerOrder"),
        10,
      ),
      metadata: {
        pricing_status: "admin_managed",
      },
    });

  if (error) {
    throw new Error(`Unable to create listing: ${error.message}`);
  }

  revalidatePath("/admin/commerce");
  revalidatePath("/shop");
}

export async function updateCommerceItem(formData: FormData) {
  await requireCommerceAdmin();

  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);

  if (!id || !name || !slug) {
    throw new Error("ID, name, and slug are required.");
  }

  const supabase = adminClient();

  const { error } = await supabase
    .from("commerce_items")
    .update({
      slug,
      name,
      description: text(formData, "description"),
      item_type: text(formData, "itemType"),
      price_cents: moneyToCents(text(formData, "price")),
      active: formData.get("active") === "on",
      image_url: text(formData, "imageUrl"),
      fulfillment_type: text(formData, "fulfillmentType"),
      square_catalog_variation_id:
        text(formData, "squareCatalogVariationId") || null,
      max_per_order: positiveInteger(
        text(formData, "maxPerOrder"),
        10,
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Unable to update listing: ${error.message}`);
  }

  revalidatePath("/admin/commerce");
  revalidatePath("/shop");
}

export async function archiveCommerceItem(formData: FormData) {
  await requireCommerceAdmin();

  const id = text(formData, "id");

  if (!id) {
    throw new Error("Listing ID is required.");
  }

  const supabase = adminClient();

  const { error } = await supabase
    .from("commerce_items")
    .update({
      active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Unable to archive listing: ${error.message}`);
  }

  revalidatePath("/admin/commerce");
  revalidatePath("/shop");
}
