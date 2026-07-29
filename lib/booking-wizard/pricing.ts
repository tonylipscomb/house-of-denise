import {
  BOOKING_TIMEZONE,
  REMAINING_BALANCE_DAYS_BEFORE_EVENT,
  getExperience,
  getPackage,
  getUpgrade,
  type BookingExperienceId,
  type BookingPackageId,
  type BookingUpgradeId
} from "@/data/booking-catalog";

export type SelectedUpgradeInput = {
  id: BookingUpgradeId | string;
  quantity: number;
};

export type PricingInput = {
  experienceId: string | null;
  packageId: string | null;
  selectedUpgrades: SelectedUpgradeInput[];
  paymentOption: "deposit" | "full";
  eventDateIso: string | null;
};

export type PricingBreakdown = {
  packagePriceCents: number;
  upgradeTotalCents: number;
  quotedSeparately: Array<{ id: string; name: string }>;
  serviceFeeCents: number;
  subtotalCents: number;
  depositPercent: number;
  depositAmountCents: number;
  amountDueTodayCents: number;
  remainingBalanceCents: number;
  remainingBalanceDueAt: string | null;
  requiresManualApproval: boolean;
  currency: "USD";
  timezone: string;
};

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

export function calculateBookingPricing(input: PricingInput): PricingBreakdown {
  const experience = getExperience(input.experienceId);
  if (!experience) {
    throw new PricingError("Select a valid experience before calculating pricing.");
  }

  const pkg = getPackage(input.packageId);
  if (!pkg) {
    throw new PricingError("Select a valid package before calculating pricing.");
  }

  if (!experience.packageIds.includes(pkg.id as BookingPackageId)) {
    throw new PricingError("That package is not available for the selected experience.");
  }

  if (pkg.priceCents === null) {
    return {
      packagePriceCents: 0,
      upgradeTotalCents: 0,
      quotedSeparately: [{ id: pkg.id, name: pkg.name }],
      serviceFeeCents: experience.serviceFeeCents,
      subtotalCents: experience.serviceFeeCents,
      depositPercent: experience.depositPercent,
      depositAmountCents: 0,
      amountDueTodayCents: 0,
      remainingBalanceCents: 0,
      remainingBalanceDueAt: null,
      requiresManualApproval: true,
      currency: "USD",
      timezone: BOOKING_TIMEZONE
    };
  }

  let upgradeTotalCents = 0;
  const quotedSeparately: Array<{ id: string; name: string }> = [];

  for (const selected of input.selectedUpgrades) {
    if (!experience.upgradeIds.includes(selected.id as BookingUpgradeId)) {
      throw new PricingError(`Upgrade not available: ${selected.id}`);
    }

    const upgrade = getUpgrade(selected.id);
    if (!upgrade) {
      throw new PricingError(`Unknown upgrade: ${selected.id}`);
    }

    const quantity = upgrade.allowQuantity ? selected.quantity : 1;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > upgrade.maxQuantity) {
      throw new PricingError(`Invalid quantity for ${upgrade.name}.`);
    }

    if (upgrade.priceCents === null) {
      quotedSeparately.push({ id: upgrade.id, name: upgrade.name });
      continue;
    }

    upgradeTotalCents += upgrade.priceCents * quantity;
  }

  const packagePriceCents = pkg.priceCents;
  const serviceFeeCents = experience.serviceFeeCents;
  const subtotalCents = packagePriceCents + upgradeTotalCents + serviceFeeCents;
  const depositPercent = experience.depositPercent;
  const depositAmountCents = Math.round((subtotalCents * depositPercent) / 100);
  const amountDueTodayCents =
    input.paymentOption === "full" ? subtotalCents : depositAmountCents;
  const remainingBalanceCents = Math.max(subtotalCents - amountDueTodayCents, 0);

  let remainingBalanceDueAt: string | null = null;
  if (remainingBalanceCents > 0 && input.eventDateIso) {
    const eventDate = new Date(`${input.eventDateIso}T12:00:00`);
    if (!Number.isNaN(eventDate.getTime())) {
      eventDate.setDate(eventDate.getDate() - REMAINING_BALANCE_DAYS_BEFORE_EVENT);
      remainingBalanceDueAt = eventDate.toISOString();
    }
  }

  return {
    packagePriceCents,
    upgradeTotalCents,
    quotedSeparately,
    serviceFeeCents,
    subtotalCents,
    depositPercent,
    depositAmountCents,
    amountDueTodayCents,
    remainingBalanceCents,
    remainingBalanceDueAt,
    requiresManualApproval: Boolean(pkg.requiresManualApproval),
    currency: "USD",
    timezone: BOOKING_TIMEZONE
  };
}

export function assertExperienceId(id: string): asserts id is BookingExperienceId {
  if (!getExperience(id)) {
    throw new PricingError("Invalid experience selection.");
  }
}
