import { Button } from "@/components/ui/Button";
import { createPageMetadata } from "@/lib/metadata";
import { requireWorkspaceMembership } from "@/lib/launchpoint/auth";
import { updateProfileAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Account Profile",
  description: "Update your House Of Denise profile.",
  path: "/account/profile"
});

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const context = await requireWorkspaceMembership(undefined, "/account/profile");
  const params = await searchParams;

  return (
    <section className="account-page account-page--narrow" aria-labelledby="profile-title">
      <p className="eyebrow">Account</p>
      <h1 id="profile-title">Profile details</h1>
      {params.status === "updated" ? <p className="auth-status">Profile updated.</p> : null}
      <form action={updateProfileAction} className="portal-form">
        <label>
          Full name
          <input className="field-control" name="fullName" defaultValue={context.profile?.full_name ?? ""} autoComplete="name" />
        </label>
        <label>
          Email
          <input className="field-control" value={context.email ?? ""} readOnly aria-describedby="email-note" />
          <span id="email-note" className="field-hint">Email changes are handled through Supabase Auth and are not enabled in this phase.</span>
        </label>
        <label>
          Phone
          <input className="field-control" name="phone" defaultValue={context.profile?.phone ?? ""} autoComplete="tel" />
        </label>
        <label className="checkbox-field">
          <input name="marketingConsent" type="checkbox" defaultChecked={context.profile?.marketing_consent ?? false} />
          <span>Send occasional House Of Denise event and product updates.</span>
        </label>
        <div className="button-row">
          <Button type="submit">Save profile</Button>
          <Button href="/account" variant="outline">Back to account</Button>
        </div>
      </form>
    </section>
  );
}
