import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginAction } from "@/app/auth/actions";

export const metadata = createPageMetadata({
  title: "Customer Login",
  description: "Log in to your House Of Denise customer account.",
  path: "/login"
});

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";

  if (data.user) redirect(next);

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-card">
        <p className="eyebrow">Customer access</p>
        <h1 id="login-title">Welcome back</h1>
        <p className="field-hint">
          Sign in to view your bookings, balances, and profile. Staff should use
          the admin sign-in for the LaunchPoint dashboard.
        </p>
        {params.status === "created" ? (
          <p className="auth-status" role="status">
            Your account is ready. Sign in with the email and password you just
            created.
          </p>
        ) : null}
        {params.status === "invalid" ? (
          <p className="auth-status" role="alert">
            Please check your details and try again.
          </p>
        ) : null}
        {params.status === "missing-config" ? (
          <p className="auth-status" role="alert">
            Sign-in is temporarily unavailable. Please try again shortly.
          </p>
        ) : null}
        <form action={loginAction} className="auth-form">
          <input type="hidden" name="next" value={next} />
          <label>
            Email
            <input
              className="field-control"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              className="field-control"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </label>
          <Button type="submit" fullWidth>
            Log in to my account
          </Button>
        </form>
        <div className="auth-links">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href={`/register?next=${encodeURIComponent(next)}`}>
            Create account
          </Link>
        </div>
        <p className="account-muted" style={{ marginTop: "0.35rem" }}>
          House of Denise staff?{" "}
          <Link href="/admin/login">Admin sign in</Link>
        </p>
      </div>
    </section>
  );
}
