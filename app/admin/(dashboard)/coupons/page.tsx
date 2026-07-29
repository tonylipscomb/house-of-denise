import { requireAdmin } from "@/lib/admin/auth";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "Admin Coupons",
  description: "Coupon management.",
  path: "/admin/coupons"
});

export default async function AdminCouponsPage() {
  await requireAdmin();
  return (
    <>
      <header className="lp-page-header">
        <div>
          <p className="lp-admin__topbar-eyebrow">Phase 3</p>
          <h1>Coupons</h1>
          <p>Server-validated discount codes for experiences and products.</p>
        </div>
      </header>
      <p className="lp-phase-note">
        No coupon tables exist yet. Coupon management arrives in Phase 3 with
        server-side validation.
      </p>
    </>
  );
}
