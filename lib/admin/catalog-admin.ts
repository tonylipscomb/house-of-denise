import "server-only";

import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  CatalogExperienceRow,
  CatalogPackageRow,
  CatalogUpgradeRow
} from "@/lib/supabase/types";

export async function listCatalogPackages() {
  const admin = getSupabaseAdminClient();
  if (!admin) return [] as CatalogPackageRow[];
  const { data } = await admin
    .from("catalog_packages")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .order("sort_order", { ascending: true });
  return (data ?? []) as CatalogPackageRow[];
}

export async function listCatalogUpgrades() {
  const admin = getSupabaseAdminClient();
  if (!admin) return [] as CatalogUpgradeRow[];
  const { data } = await admin
    .from("catalog_upgrades")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .order("sort_order", { ascending: true });
  return (data ?? []) as CatalogUpgradeRow[];
}

export async function listCatalogExperiences() {
  const admin = getSupabaseAdminClient();
  if (!admin) return [] as CatalogExperienceRow[];
  const { data } = await admin
    .from("catalog_experiences")
    .select("*")
    .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
    .order("sort_order", { ascending: true });
  return (data ?? []) as CatalogExperienceRow[];
}

export async function saveCatalogPackage(input: {
  id: string;
  name: string;
  description: string;
  priceCents: number | null;
  guestAllowance: number;
  fragranceOptions: number;
  features: string[];
  mostPopular: boolean;
  requiresManualApproval: boolean;
  active: boolean;
  sortOrder: number;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("catalog_packages").upsert({
    id: input.id,
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    name: input.name,
    description: input.description,
    price_cents: input.priceCents,
    guest_allowance: input.guestAllowance,
    fragrance_options: input.fragranceOptions,
    features: input.features,
    most_popular: input.mostPopular,
    requires_manual_approval: input.requiresManualApproval,
    active: input.active,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
}

export async function saveCatalogUpgrade(input: {
  id: string;
  name: string;
  description: string;
  pricingType: CatalogUpgradeRow["pricing_type"];
  priceCents: number | null;
  allowQuantity: boolean;
  maxQuantity: number;
  active: boolean;
  sortOrder: number;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("catalog_upgrades").upsert({
    id: input.id,
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    name: input.name,
    description: input.description,
    pricing_type: input.pricingType,
    price_cents: input.pricingType === "quote" ? null : input.priceCents,
    allow_quantity: input.allowQuantity,
    max_quantity: input.maxQuantity,
    active: input.active,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
}

export async function saveCatalogExperience(input: {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  startingPriceCents: number;
  durationLabel: string;
  guestRangeLabel: string;
  minGuests: number;
  maxGuests: number;
  durationMinutes: number;
  depositPercent: number;
  serviceFeeCents: number;
  mostPopular: boolean;
  packageIds: string[];
  upgradeIds: string[];
  active: boolean;
  featured: boolean;
  sortOrder: number;
}) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase admin client is not configured.");

  const { error } = await admin.from("catalog_experiences").upsert({
    id: input.id,
    workspace_id: HOUSE_OF_DENISE_WORKSPACE_ID,
    slug: input.slug,
    title: input.title,
    description: input.description,
    image_src: input.imageSrc,
    image_alt: input.imageAlt,
    starting_price_cents: input.startingPriceCents,
    duration_label: input.durationLabel,
    guest_range_label: input.guestRangeLabel,
    min_guests: input.minGuests,
    max_guests: input.maxGuests,
    duration_minutes: input.durationMinutes,
    deposit_percent: input.depositPercent,
    service_fee_cents: input.serviceFeeCents,
    most_popular: input.mostPopular,
    package_ids: input.packageIds,
    upgrade_ids: input.upgradeIds,
    active: input.active,
    featured: input.featured,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
}
