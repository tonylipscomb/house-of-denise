import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Cart",
  description: "Review items in your House Of Denise cart.",
  path: "/cart"
});

export default function CartPage() {
  return (
    <Section spacing="standard">
      <EmptyState
        title="Your cart is empty"
        description="Browse the shop to discover handmade goods made with care."
        action={{ label: "Shop the collection", href: "/shop" }}
      />
    </Section>
  );
}
