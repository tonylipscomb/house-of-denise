import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { registerAction } from "@/app/auth/actions";

export const metadata = createPageMetadata({
  title: "Register",
  description: "Create your House Of Denise customer account.",
  path: "/register"
});

function bookingReferenceFromNext(next: string) {
  const match = next.match(/^\/account\/bookings\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function statusMessage(status?: string) {
  switch (status) {
    case "exists":
      return "An account with that email already exists. Sign in, or use forgot password if you need access.";
    case "weak-password":
      return "Choose a password with at least 8 characters.";
    case "invalid-email":
      return "Enter a valid email address.";
    case "missing-name":
      return "Please add your full name.";
    case "rate-limit":
      return "Too many email attempts just now. Wait a minute and try again, or sign in if you already registered.";
    case "missing-config":
      return "Account signup is temporarily unavailable. Please contact House of Denise.";
    case "error":
      return "We could not create that account. Please try again.";
    default:
      return null;
  }
}

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; status?: string; email?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";
  const emailPrefill = params.email?.trim().toLowerCase() ?? "";
  const bookingReference = bookingReferenceFromNext(next);
  const message = statusMessage(params.status);

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-card">
        <p className="eyebrow">House Of Denise account</p>
        <h1 id="register-title">Create your account</h1>
        {bookingReference ? (
          <p className="auth-status">
            After you create your account, we{"\u2019"}ll attach booking{" "}
            <strong>{bookingReference}</strong> to this email.
          </p>
        ) : null}
        {message ? (
          <p className="auth-status" role="alert">
            {message}{" "}
            {params.status === "exists" ? (
              <Link href={`/login?next=${encodeURIComponent(next)}`}>
                Sign in
              </Link>
            ) : null}
          </p>
        ) : null}
        <form action={registerAction} className="auth-form">
          <input type="hidden" name="next" value={next} />
          {bookingReference ? (
            <input type="hidden" name="bookingReference" value={bookingReference} />
          ) : null}
          <label>
            Full name
            <input
              className="field-control"
              name="fullName"
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email
            <input
              className="field-control"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={emailPrefill}
              required
            />
          </label>
          <label>
            Password
            <input
              className="field-control"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <Button type="submit" fullWidth>
            Create account
          </Button>
        </form>
        <p className="auth-links">
          <Link href={`/login?next=${encodeURIComponent(next)}`}>
            Already have an account?
          </Link>
        </p>
      </div>
    </section>
  );
}
