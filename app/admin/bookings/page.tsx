import { EmptyState } from "@/components/ui/EmptyState";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({ title: "Admin Bookings", description: "View workspace bookings.", path: "/admin/bookings" });

export default function AdminBookingsPage() {
  return <EmptyState title="No booking flow yet" description="The bookings table is ready, but public direct booking waits for availability and payment phases." />;
}
