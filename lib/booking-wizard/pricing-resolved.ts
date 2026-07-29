import "server-only";

import {
  calculateBookingPricing,
  type PricingBreakdown,
  type PricingInput
} from "@/lib/booking-wizard/pricing";
import {
  catalogGetExperience,
  catalogGetPackage,
  catalogGetUpgrade,
  getResolvedBookingCatalog,
  type ResolvedBookingCatalog
} from "@/lib/booking-wizard/resolved-catalog";

export async function calculateBookingPricingResolved(
  input: PricingInput,
  catalog?: ResolvedBookingCatalog
): Promise<PricingBreakdown> {
  const resolved = catalog ?? (await getResolvedBookingCatalog());
  return calculateBookingPricing(input, {
    getExperience: (id) => catalogGetExperience(resolved, id),
    getPackage: (id) => catalogGetPackage(resolved, id),
    getUpgrade: (id) => catalogGetUpgrade(resolved, id)
  });
}
