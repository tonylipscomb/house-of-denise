/**
 * Shared admin segment layout.
 * Auth belongs only in `(dashboard)/layout.tsx` so `/admin/login`
 * never enters the requireAdmin redirect loop during RSC fetches.
 */
export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}
