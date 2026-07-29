import Link from "next/link";
import { isShopEnabled } from "@/lib/shop-flag";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Settings",
  description: "House of Denise admin settings.",
  path: "/admin/settings"
});

export default async function AdminSettingsPage() {
  const shopEnabled = isShopEnabled();
  const supabase = await createSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  const { data: authData } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  const [workspace, membership] = admin && authData.user
    ? await Promise.all([
        admin
          .from("workspaces")
          .select("name, email, phone, timezone")
          .eq("id", HOUSE_OF_DENISE_WORKSPACE_ID)
          .maybeSingle(),
        admin
          .from("workspace_memberships")
          .select("role")
          .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
          .eq("user_id", authData.user.id)
          .eq("status", "active")
          .maybeSingle()
      ])
    : [{ data: null }, { data: null }];

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Workspace</p>
          <h1>Settings</h1>
          <p>
            Workspace identity and feature flags. Deeper settings land in later
            phases.
          </p>
        </div>
      </header>

      <div className="lp-grid-2">
        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Workspace</h2>
          </header>
          <dl className="lp-dl">
            <div>
              <dt>Name</dt>
              <dd>{workspace.data?.name || "House Of Denise"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{workspace.data?.email || "—"}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{workspace.data?.phone || "—"}</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>{workspace.data?.timezone || "—"}</dd>
            </div>
            <div>
              <dt>Your role</dt>
              <dd>{membership.data?.role || "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="lp-panel">
          <header className="lp-panel__header">
            <h2>Feature flags</h2>
          </header>
          <dl className="lp-dl">
            <div>
              <dt>Shop enabled</dt>
              <dd>
                {shopEnabled ? "true" : "false"}{" "}
                <span className="lp-muted">(NEXT_PUBLIC_SHOP_ENABLED)</span>
              </dd>
            </div>
            <div>
              <dt>Public shop</dt>
              <dd>
                {shopEnabled
                  ? "Flag is on — storefront wiring is Phase 3"
                  : "Coming Soon page is active"}
              </dd>
            </div>
          </dl>
          <div className="lp-stack" style={{ marginTop: "1rem" }}>
            <Link href="/admin/services" className="lp-btn">
              Manage services (legacy)
            </Link>
            <Link href="/admin/commerce" className="lp-btn">
              Manage commerce catalog
            </Link>
            <Link href="/" className="lp-btn lp-btn--primary">
              View public website
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
