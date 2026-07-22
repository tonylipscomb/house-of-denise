import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { resetPasswordAction } from "@/app/auth/actions";

export const metadata = createPageMetadata({
  title: "Reset Password",
  description: "Complete your House Of Denise password reset.",
  path: "/reset-password"
});

export default function ResetPasswordPage() {
  return (
    <section className="auth-page" aria-labelledby="reset-title">
      <div className="auth-card">
        <p className="eyebrow">Secure reset</p>
        <h1 id="reset-title">Choose a new password</h1>
        <form action={resetPasswordAction} className="auth-form">
          <label>
            New password
            <input className="field-control" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <Button type="submit" fullWidth>Update password</Button>
        </form>
      </div>
    </section>
  );
}
