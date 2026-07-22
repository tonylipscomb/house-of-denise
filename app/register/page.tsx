import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { registerAction } from "@/app/auth/actions";

export const metadata = createPageMetadata({
  title: "Register",
  description: "Create your House Of Denise customer account.",
  path: "/register"
});

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string; status?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/account";

  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-card">
        <p className="eyebrow">House Of Denise account</p>
        <h1 id="register-title">Create your account</h1>
        {params.status ? <p className="auth-status">We could not create that account. Please try again.</p> : null}
        <form action={registerAction} className="auth-form">
          <input type="hidden" name="next" value={next} />
          <label>
            Full name
            <input className="field-control" name="fullName" autoComplete="name" required />
          </label>
          <label>
            Email
            <input className="field-control" name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input className="field-control" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <Button type="submit" fullWidth>Create account</Button>
        </form>
        <p className="auth-links">
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Already have an account?</Link>
        </p>
      </div>
    </section>
  );
}
