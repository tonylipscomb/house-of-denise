import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { forgotPasswordAction } from "@/app/auth/actions";

export const metadata = createPageMetadata({
  title: "Forgot Password",
  description: "Request a House Of Denise password reset link.",
  path: "/forgot-password"
});

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;

  return (
    <section className="auth-page" aria-labelledby="forgot-title">
      <div className="auth-card">
        <p className="eyebrow">Password reset</p>
        <h1 id="forgot-title">Reset your password</h1>
        {params.status === "sent" ? <p className="auth-status">If an account exists, a reset link is on its way.</p> : null}
        <form action={forgotPasswordAction} className="auth-form">
          <label>
            Email
            <input className="field-control" name="email" type="email" autoComplete="email" required />
          </label>
          <Button type="submit" fullWidth>Send reset link</Button>
        </form>
        <p className="auth-links"><Link href="/login">Back to login</Link></p>
      </div>
    </section>
  );
}
