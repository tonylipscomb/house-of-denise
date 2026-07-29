"use client";

import {
  bookingPackages,
  bookingUpgrades,
  formatUsdFromCents,
  getExperience,
  type BookingPackageId,
  type BookingUpgradeId
} from "@/data/booking-catalog";
import { Button } from "@/components/ui/Button";
import { useBookingWizard } from "./BookingWizardProvider";
import { cn } from "@/lib/cn";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Flower2,
  Gift,
  Leaf,
  MapPinned,
  Package,
  PenLine,
  Sparkles,
  Star,
  Tags,
  Users,
  Wine
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const packageIcons: Record<BookingPackageId, LucideIcon> = {
  essential: Sparkles,
  signature: Flower2,
  luxury: Wine,
  custom: Leaf
};

const upgradeIcons: Record<BookingUpgradeId, LucideIcon> = {
  "additional-guests": Users,
  "custom-labels": Tags,
  "gift-packaging": Gift,
  "travel-outside-area": MapPinned,
  "extra-fragrance-station": Package,
  "extended-event-time": Clock3,
  "decor-upgrade": Flower2,
  "luxury-takeaway-favors": Sparkles,
  "custom-signage": PenLine
};

function formatUpgradePrice(upgrade: (typeof bookingUpgrades)[BookingUpgradeId]): string {
  if (upgrade.priceCents === null) return "Quoted separately";
  const amount = formatUsdFromCents(upgrade.priceCents);
  if (upgrade.id === "additional-guests") return `+${amount} / guest`;
  if (upgrade.id === "extended-event-time") return `+${amount} / hr`;
  if (upgrade.allowQuantity) return `+${amount} each`;
  return `+${amount} flat`;
}

export function PackageSelector() {
  const { state, dispatch, nextStep, prevStep } = useBookingWizard();
  const experience = getExperience(state.selectedExperienceId);

  if (!experience) {
    return (
      <section className="bw-panel">
        <p>Select an experience first.</p>
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
          Back
        </Button>
      </section>
    );
  }

  const packages = experience.packageIds.map((id) => bookingPackages[id]);
  const upgrades = experience.upgradeIds.map((id) => bookingUpgrades[id]);

  return (
    <section className="bw-panel" aria-labelledby="package-title">
      <header className="bw-panel__header">
        <p className="lux-eyebrow">STEP 3 OF 6</p>
        <h2 id="package-title">Choose Your Package</h2>
        <p>Package options update based on your selected experience.</p>
      </header>

      <div
        className="bw-package-grid"
        style={{ ["--bw-package-count" as string]: String(Math.min(packages.length, 4)) }}
        role="radiogroup"
        aria-label="Package options"
      >
        {packages.map((pkg) => {
          const selected = state.selectedPackageId === pkg.id;
          const Icon = packageIcons[pkg.id];
          return (
            <button
              key={pkg.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "bw-package-card",
                selected && "is-selected",
                pkg.mostPopular && "is-popular"
              )}
              onClick={() =>
                dispatch({ type: "SELECT_PACKAGE", packageId: pkg.id as BookingPackageId })
              }
            >
              {pkg.mostPopular ? <span className="bw-badge bw-badge--ribbon">Most Popular</span> : null}

              <span className="bw-package-card__icon" aria-hidden="true">
                <Icon size={28} strokeWidth={1.5} />
              </span>

              <h3>{pkg.name}</h3>

              <p className="bw-package-card__price">
                {pkg.priceCents === null ? "Custom Pricing" : formatUsdFromCents(pkg.priceCents)}
              </p>

              <p className="bw-package-card__desc">{pkg.description}</p>

              <ul className="bw-package-card__features">
                {pkg.features.map((feature) => (
                  <li key={feature}>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <span className={cn("bw-package-card__radio", selected && "is-on")} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="bw-upgrades">
        <h3>
          <Star size={16} aria-hidden="true" />
          Optional Upgrades
        </h3>
        <div className="bw-upgrade-list">
          {upgrades.map((upgrade) => {
            const selected = state.selectedUpgrades.find((item) => item.id === upgrade.id);
            const Icon = upgradeIcons[upgrade.id];
            return (
              <label key={upgrade.id} className={cn("bw-upgrade", selected && "is-selected")}>
                <input
                  type="checkbox"
                  checked={Boolean(selected)}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_UPGRADE",
                      upgradeId: upgrade.id as BookingUpgradeId,
                      selected: e.target.checked,
                      quantity: selected?.quantity ?? 1
                    })
                  }
                />
                <span className="bw-upgrade__icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <span className="bw-upgrade__copy">
                  <strong>{upgrade.name}</strong>
                  <span>{upgrade.description}</span>
                </span>
                <span className="bw-upgrade__price">{formatUpgradePrice(upgrade)}</span>
                {upgrade.allowQuantity && selected ? (
                  <input
                    className="bw-upgrade__qty"
                    type="number"
                    min={1}
                    max={upgrade.maxQuantity}
                    value={selected.quantity}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_UPGRADE",
                        upgradeId: upgrade.id as BookingUpgradeId,
                        selected: true,
                        quantity: Number(e.target.value) || 1
                      })
                    }
                    aria-label={`${upgrade.name} quantity`}
                  />
                ) : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="bw-step-actions">
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft size={16} aria-hidden="true" />}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={!state.selectedPackageId}
          rightIcon={<ChevronRight size={16} aria-hidden="true" />}
          onClick={() => {
            if (state.selectedPackageId) nextStep();
          }}
        >
          Continue to Schedule
        </Button>
      </div>
    </section>
  );
}
