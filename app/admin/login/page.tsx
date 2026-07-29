import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/auth/actions";
import { loginAction } from "@/app/auth/actions";
import { canAccessAdminDashboard } from "@/lib/admin/permissions";
import { HOUSE_OF_DENISE_WORKSPACE_ID } from "@/lib/launchpoint/constants";
import { createPageMetadata } from "@/lib/metadata";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/supabase/types";

export const metadata = createPageMetadata({
  title: "Admin Login",
  description: "Sign in to the House of Denise admin dashboard.",
  path: "/admin/login"
});

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const next =
    params.next?.startsWith("/") &&
    !params.next.startsWith("//") &&
    params.next !== "/admin/login"
      ? params.next
      : "/admin";

  let signedInWithoutAdmin = false;
  let signedInEmail: string | null = null;

  if (data.user) {
    signedInEmail = data.user.email ?? null;
    const admin = getSupabaseAdminClient();
    const membership = admin
      ? await admin
          .from("workspace_memberships")
          .select("role, status")
          .eq("workspace_id", HOUSE_OF_DENISE_WORKSPACE_ID)
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .maybeSingle()
      : { data: null };

    const role = (membership.data?.role ?? "customer") as WorkspaceRole;
    if (canAccessAdminDashboard(role)) {
      redirect(next);
    }
    signedInWithoutAdmin = true;
  }

  const statusMessage = signedInWithoutAdmin
    ? `This account is signed in, but it does not have admin access. Sign out and use an owner/admin account, or return to the website.${
        signedInEmail ? ` Currently signed in as ${signedInEmail}.` : ""
      }`
    : params.status === "admin-required"
      ? "Admin access is required. Sign in with an owner or admin workspace account."
      : params.status
        ? "Please check your email and password, then try again."
        : null;

  return (
    <div className="lp-admin-login">
      <div className="lp-admin-login__card">
        <p className="lp-admin__eyebrow">LaunchPoint Digital</p>
        <h1>Admin sign in</h1>
        <p className="lp-muted">
          Authorized House of Denise staff only. Use your workspace account.
        </p>
        {statusMessage ? (
          <p className="lp-phase-note" role="alert">
            {statusMessage}
          </p>
        ) : null}

        {signedInWithoutAdmin ? (
          <div className="lp-form">
            <form action={logoutAction}>
              <button type="submit" className="lp-btn lp-btn--primary">
                Sign out and use another account
              </button>
            </form>
            <Link href="/account" className="lp-btn">
              Go to my account
            </Link>
            <Link href="/" className="lp-btn">
              Return to website
            </Link>
          </div>
        ) : (
          <form action={loginAction} className="lp-form">
            <input type="hidden" name="next" value={next} />
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
              />
            </label>
            <button type="submit" className="lp-btn lp-btn--primary">
              Sign in to admin
            </button>
          </form>
        )}

        <p className="lp-muted">
          <Link href="/">Return to website</Link>
          {" · "}
          <Link href="/login">Customer account login</Link>
          {" · "}
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
