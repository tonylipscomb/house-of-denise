import { StatusBadge } from "@/components/admin/StatusBadge";
import { listCatalogPackages, listCatalogUpgrades } from "@/lib/admin/catalog-admin";
import { formatUsdFromCents } from "@/lib/admin/dashboard-utils";
import { createPageMetadata } from "@/lib/metadata";
import { savePackageAction, saveUpgradeAction } from "../phase2-actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Packages & Upgrades",
  description: "Manage packages and upgrades.",
  path: "/admin/packages"
});

export default async function AdminPackagesPage() {
  const [packages, upgrades] = await Promise.all([
    listCatalogPackages(),
    listCatalogUpgrades()
  ]);

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Catalog</p>
          <h1>Packages & upgrades</h1>
          <p>
            Edits publish to the catalog tables used by checkout pricing. Existing
            bookings keep their original price snapshots.
          </p>
        </div>
      </header>

      <p className="lp-phase-note">
        Wizard UI may still show static labels until refresh; checkout amounts are
        recalculated server-side from this catalog.
      </p>

      <h2 className="lp-section-title">Packages</h2>
      <div className="lp-stack">
        {packages.map((pkg) => (
          <section key={pkg.id} className="lp-panel">
            <header className="lp-panel__header">
              <h3>{pkg.name}</h3>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {pkg.most_popular ? <StatusBadge label="Most popular" tone="warning" /> : null}
                <StatusBadge
                  label={pkg.active ? "Active" : "Inactive"}
                  tone={pkg.active ? "success" : "neutral"}
                />
              </div>
            </header>
            <form action={savePackageAction} className="lp-form">
              <input type="hidden" name="id" value={pkg.id} />
              <div className="lp-grid-2">
                <label>
                  Name
                  <input name="name" defaultValue={pkg.name} required />
                </label>
                <label>
                  Price (cents, blank = quote)
                  <input
                    name="priceCents"
                    type="number"
                    defaultValue={pkg.price_cents ?? ""}
                  />
                </label>
              </div>
              <label>
                Description
                <textarea name="description" rows={2} defaultValue={pkg.description} />
              </label>
              <label>
                Features (one per line)
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={
                    Array.isArray(pkg.features) ? pkg.features.join("\n") : ""
                  }
                />
              </label>
              <div className="lp-grid-3">
                <label>
                  Guest allowance
                  <input
                    name="guestAllowance"
                    type="number"
                    defaultValue={pkg.guest_allowance}
                  />
                </label>
                <label>
                  Fragrance options
                  <input
                    name="fragranceOptions"
                    type="number"
                    defaultValue={pkg.fragrance_options}
                  />
                </label>
                <label>
                  Sort order
                  <input name="sortOrder" type="number" defaultValue={pkg.sort_order} />
                </label>
              </div>
              <div className="lp-grid-3">
                <label className="lp-check">
                  <input
                    type="checkbox"
                    name="mostPopular"
                    defaultChecked={pkg.most_popular}
                  />
                  Most popular
                </label>
                <label className="lp-check">
                  <input
                    type="checkbox"
                    name="requiresManualApproval"
                    defaultChecked={pkg.requires_manual_approval}
                  />
                  Manual approval
                </label>
                <label className="lp-check">
                  <input type="checkbox" name="active" defaultChecked={pkg.active} />
                  Active
                </label>
              </div>
              <p className="lp-muted">
                Current:{" "}
                {pkg.price_cents === null
                  ? "Quote required"
                  : formatUsdFromCents(pkg.price_cents)}
              </p>
              <button type="submit" className="lp-btn lp-btn--primary">
                Save package
              </button>
            </form>
          </section>
        ))}
      </div>

      <h2 className="lp-section-title">Upgrades</h2>
      <div className="lp-stack">
        {upgrades.map((upgrade) => (
          <section key={upgrade.id} className="lp-panel">
            <header className="lp-panel__header">
              <h3>{upgrade.name}</h3>
              <StatusBadge label={upgrade.pricing_type.replaceAll("_", " ")} tone="info" />
            </header>
            <form action={saveUpgradeAction} className="lp-form">
              <input type="hidden" name="id" value={upgrade.id} />
              <div className="lp-grid-2">
                <label>
                  Name
                  <input name="name" defaultValue={upgrade.name} required />
                </label>
                <label>
                  Pricing type
                  <select name="pricingType" defaultValue={upgrade.pricing_type}>
                    <option value="flat">Flat fee</option>
                    <option value="per_guest">Per guest</option>
                    <option value="per_hour">Per hour</option>
                    <option value="quote">Quote required</option>
                  </select>
                </label>
              </div>
              <label>
                Description
                <textarea name="description" rows={2} defaultValue={upgrade.description} />
              </label>
              <div className="lp-grid-3">
                <label>
                  Price (cents)
                  <input
                    name="priceCents"
                    type="number"
                    defaultValue={upgrade.price_cents ?? ""}
                  />
                </label>
                <label>
                  Max quantity
                  <input
                    name="maxQuantity"
                    type="number"
                    defaultValue={upgrade.max_quantity}
                  />
                </label>
                <label>
                  Sort order
                  <input name="sortOrder" type="number" defaultValue={upgrade.sort_order} />
                </label>
              </div>
              <div className="lp-grid-2">
                <label className="lp-check">
                  <input
                    type="checkbox"
                    name="allowQuantity"
                    defaultChecked={upgrade.allow_quantity}
                  />
                  Allow quantity
                </label>
                <label className="lp-check">
                  <input type="checkbox" name="active" defaultChecked={upgrade.active} />
                  Active
                </label>
              </div>
              <button type="submit" className="lp-btn lp-btn--primary">
                Save upgrade
              </button>
            </form>
          </section>
        ))}
      </div>
    </>
  );
}
