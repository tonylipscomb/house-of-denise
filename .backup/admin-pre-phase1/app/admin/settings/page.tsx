import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({ title: "Admin Settings", description: "Workspace settings foundation.", path: "/admin/settings" });

export default function AdminSettingsPage() {
  return <div className="empty-state"><h2 className="empty-state__title">Settings foundation ready</h2><p className="empty-state__description">Workspace settings are stored in Supabase. Editing controls can be expanded after owner onboarding is confirmed.</p></div>;
}
