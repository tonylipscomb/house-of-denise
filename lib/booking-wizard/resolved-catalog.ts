import "server-only";

import {
  bookingExperiences,
  bookingPackages,
  bookingUpgrades,
  type BookingExperience,
  type BookingExperienceId,
  type BookingPackage,
  type BookingPackageId,
  type BookingUpgrade,
  type BookingUpgradeId
} from "@/data/booking-catalog";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type ResolvedBookingCatalog = {
  experiences: BookingExperience[];
  packages: Record<string, BookingPackage>;
  upgrades: Record<string, BookingUpgrade>;
  source: "database" | "static";
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function getResolvedBookingCatalog(): Promise<ResolvedBookingCatalog> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return {
      experiences: bookingExperiences,
      packages: bookingPackages,
      upgrades: bookingUpgrades,
      source: "static"
    };
  }

  const [packagesResult, upgradesResult, experiencesResult] = await Promise.all([
    admin
      .from("catalog_packages")
      .select("*")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    admin
      .from("catalog_upgrades")
      .select("*")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    admin
      .from("catalog_experiences")
      .select("*")
      .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
      .eq("active", true)
      .order("sort_order", { ascending: true })
  ]);

  if (
    packagesResult.error ||
    upgradesResult.error ||
    experiencesResult.error ||
    !packagesResult.data?.length ||
    !upgradesResult.data?.length ||
    !experiencesResult.data?.length
  ) {
    return {
      experiences: bookingExperiences,
      packages: bookingPackages,
      upgrades: bookingUpgrades,
      source: "static"
    };
  }

  const packages: Record<string, BookingPackage> = {};
  for (const row of packagesResult.data) {
    packages[row.id] = {
      id: row.id as BookingPackageId,
      name: row.name,
      description: row.description,
      priceCents: row.price_cents,
      mostPopular: row.most_popular,
      features: asStringArray(row.features),
      requiresManualApproval: row.requires_manual_approval,
      guestAllowance: row.guest_allowance,
      fragranceOptions: row.fragrance_options
    };
  }

  const upgrades: Record<string, BookingUpgrade> = {};
  for (const row of upgradesResult.data) {
    upgrades[row.id] = {
      id: row.id as BookingUpgradeId,
      name: row.name,
      description: row.description,
      // quote / null price stays quote-required for wizard compatibility
      priceCents: row.pricing_type === "quote" ? null : row.price_cents,
      allowQuantity: row.allow_quantity,
      maxQuantity: row.max_quantity
    };
  }

  const experiences: BookingExperience[] = experiencesResult.data.map((row) => ({
    id: row.id as BookingExperienceId,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageSrc: row.image_src || "/images/house-of-denise/luxury-workshops.jpg",
    imageAlt: row.image_alt || row.title,
    startingPriceCents: row.starting_price_cents,
    durationLabel: row.duration_label || "",
    guestRangeLabel: row.guest_range_label || "",
    minGuests: row.min_guests,
    maxGuests: row.max_guests,
    durationMinutes: row.duration_minutes,
    mostPopular: row.most_popular,
    packageIds: asStringArray(row.package_ids) as BookingPackageId[],
    upgradeIds: asStringArray(row.upgrade_ids) as BookingUpgradeId[],
    depositPercent: row.deposit_percent,
    serviceFeeCents: row.service_fee_cents
  }));

  return { experiences, packages, upgrades, source: "database" };
}

export function catalogGetExperience(
  catalog: ResolvedBookingCatalog,
  id: string | null | undefined
) {
  if (!id) return undefined;
  return catalog.experiences.find((item) => item.id === id || item.slug === id);
}

export function catalogGetPackage(
  catalog: ResolvedBookingCatalog,
  id: string | null | undefined
) {
  if (!id) return undefined;
  return catalog.packages[id];
}

export function catalogGetUpgrade(
  catalog: ResolvedBookingCatalog,
  id: string | null | undefined
) {
  if (!id) return undefined;
  return catalog.upgrades[id];
}
