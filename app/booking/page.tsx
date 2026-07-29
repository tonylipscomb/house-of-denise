import { BookingWizard } from "@/components/booking/wizard/BookingWizard";
import { createPageMetadata } from "@/lib/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = createPageMetadata({
  title: "Book an Experience",
  description:
    "Curated fragrance experiences, private events, workshops, and mobile fragrance bar bookings from House of Denise.",
  path: "/booking",
  image: "/images/house-of-denise/signature-experience.jpg"
});

export default async function BookingPage() {
  let initialCustomer: { fullName?: string; email?: string; phone?: string } | undefined;

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", user.id)
          .maybeSingle();
        initialCustomer = {
          fullName: profile?.full_name ?? user.user_metadata?.full_name ?? "",
          email: profile?.email ?? user.email ?? "",
          phone: profile?.phone ?? ""
        };
      }
    }
  } catch {
    initialCustomer = undefined;
  }

  return <BookingWizard initialCustomer={initialCustomer} />;
}
