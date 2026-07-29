import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { isShopEnabled } from "@/lib/shop-flag";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "Admin Products",
  description: "Product manager for House of Denise.",
  path: "/admin/products"
});

export default async function AdminProductsPage() {
  await requireAdmin();
  const shopEnabled = isShopEnabled();

  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Phase 3</p>
          <h1>Products</h1>
          <p>
            Product Manager pattern for catalog, images, variants, and inventory.
            Public shop remains Coming Soon while{" "}
            <code className="lp-code">NEXT_PUBLIC_SHOP_ENABLED</code> is{" "}
            {shopEnabled ? "true" : "false"}.
          </p>
        </div>
        <Link href="/admin/commerce" className="lp-btn lp-btn--primary">
          Open commerce catalog
        </Link>
      </header>
      <p className="lp-phase-note">
        Full Product Manager UI arrives in Phase 3. Existing commerce item admin
        remains available and does not enable the public storefront.
      </p>
    </>
  );
}
