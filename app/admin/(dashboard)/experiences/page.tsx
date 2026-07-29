import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  listCatalogExperiences,
  listCatalogPackages,
  listCatalogUpgrades
} from "@/lib/admin/catalog-admin";
import { formatUsdFromCents } from "@/lib/admin/dashboard-utils";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveExperienceCatalogAction } from "../phase2-actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Experiences",
  description: "Manage House of Denise experiences.",
  path: "/admin/experiences"
});

export default async function AdminExperiencesPage() {
  const [experiences, packages, upgrades, services] = await Promise.all([
    listCatalogExperiences(),
    listCatalogPackages(),
    listCatalogUpgrades(),
    (async () => {
      const admin = getSupabaseAdminClient();
      if (!admin) return [];
      const { data } = await admin
        .from("services")
        .select("id, name, slug, active, featured, booking_mode, sort_order")
        .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
        .order("sort_order", { ascending: true });
      return data ?? [];
    })()
  ]);

  const packageIds = packages.map((item) => item.id).join(",");
  const upgradeIds = upgrades.map((item) => item.id).join(",");

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Catalog</p>
          <h1>Experiences</h1>
          <p>
            Manage wizard experiences and LaunchPoint services. Checkout uses the
            published catalog tables; historical bookings keep their snapshots.
          </p>
        </div>
        <Link href="/admin/services" className="lp-btn">
          Legacy services
        </Link>
      </header>

      <section className="lp-panel" style={{ marginBottom: "1rem" }}>
        <header className="lp-panel__header">
          <h2>LaunchPoint services</h2>
          <Link href="/admin/services/new" className="lp-table__link">
            Add service
          </Link>
        </header>
        {!services.length ? (
          <p className="lp-empty">No services yet.</p>
        ) : (
          <ul className="lp-activity">
            {services.map((service) => (
              <li key={service.id}>
                <div className="lp-activity__main">
                  <Link
                    href={`/admin/services/${service.id}`}
                    className="lp-activity__title"
                  >
                    {service.name}
                  </Link>
                  <span className="lp-activity__subtitle">
                    {service.slug} · {service.booking_mode}
                  </span>
                </div>
                <StatusBadge
                  label={service.active ? "Active" : "Inactive"}
                  tone={service.active ? "success" : "neutral"}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="lp-stack">
        {experiences.map((experience) => (
          <section key={experience.id} className="lp-panel">
            <header className="lp-panel__header">
              <h2>{experience.title}</h2>
              <StatusBadge
                label={experience.active ? "Active" : "Inactive"}
                tone={experience.active ? "success" : "neutral"}
              />
            </header>
            <form action={saveExperienceCatalogAction} className="lp-form">
              <input type="hidden" name="id" value={experience.id} />
              <div className="lp-grid-2">
                <label>
                  Title
                  <input name="title" defaultValue={experience.title} required />
                </label>
                <label>
                  Slug
                  <input name="slug" defaultValue={experience.slug} required />
                </label>
              </div>
              <label>
                Description
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={experience.description}
                />
              </label>
              <div className="lp-grid-2">
                <label>
                  Image path
                  <input name="imageSrc" defaultValue={experience.image_src ?? ""} />
                </label>
                <label>
                  Image alt
                  <input name="imageAlt" defaultValue={experience.image_alt ?? ""} />
                </label>
              </div>
              <div className="lp-grid-3">
                <label>
                  Starting price (cents)
                  <input
                    name="startingPriceCents"
                    type="number"
                    defaultValue={experience.starting_price_cents}
                  />
                </label>
                <label>
                  Deposit %
                  <input
                    name="depositPercent"
                    type="number"
                    defaultValue={experience.deposit_percent}
                  />
                </label>
                <label>
                  Service fee (cents)
                  <input
                    name="serviceFeeCents"
                    type="number"
                    defaultValue={experience.service_fee_cents}
                  />
                </label>
              </div>
              <div className="lp-grid-3">
                <label>
                  Min guests
                  <input name="minGuests" type="number" defaultValue={experience.min_guests} />
                </label>
                <label>
                  Max guests
                  <input name="maxGuests" type="number" defaultValue={experience.max_guests} />
                </label>
                <label>
                  Duration minutes
                  <input
                    name="durationMinutes"
                    type="number"
                    defaultValue={experience.duration_minutes}
                  />
                </label>
              </div>
              <div className="lp-grid-2">
                <label>
                  Duration label
                  <input
                    name="durationLabel"
                    defaultValue={experience.duration_label ?? ""}
                  />
                </label>
                <label>
                  Guest range label
                  <input
                    name="guestRangeLabel"
                    defaultValue={experience.guest_range_label ?? ""}
                  />
                </label>
              </div>
              <label>
                Package IDs (comma-separated)
                <input
                  name="packageIds"
                  defaultValue={
                    Array.isArray(experience.package_ids)
                      ? experience.package_ids.join(",")
                      : packageIds
                  }
                />
              </label>
              <label>
                Upgrade IDs (comma-separated)
                <input
                  name="upgradeIds"
                  defaultValue={
                    Array.isArray(experience.upgrade_ids)
                      ? experience.upgrade_ids.join(",")
                      : upgradeIds
                  }
                />
              </label>
              <div className="lp-grid-3">
                <label>
                  Sort order
                  <input name="sortOrder" type="number" defaultValue={experience.sort_order} />
                </label>
                <label className="lp-check">
                  <input
                    type="checkbox"
                    name="mostPopular"
                    defaultChecked={experience.most_popular}
                  />
                  Most popular
                </label>
                <label className="lp-check">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={experience.featured}
                  />
                  Featured
                </label>
              </div>
              <label className="lp-check">
                <input type="checkbox" name="active" defaultChecked={experience.active} />
                Active in catalog
              </label>
              <p className="lp-muted">
                From {formatUsdFromCents(experience.starting_price_cents)}
              </p>
              <button type="submit" className="lp-btn lp-btn--primary">
                Save experience
              </button>
            </form>
          </section>
        ))}
      </div>
    </>
  );
}
