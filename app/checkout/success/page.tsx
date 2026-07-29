import Link from "next/link";
import { getStripeClient } from "@/lib/stripe/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string;
    session_id?: string;
  }>;
}) {
  const { reference, session_id: sessionId } = await searchParams;
  let paid = false;

  if (sessionId) {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      paid = session.payment_status === "paid";

      if (
        session.metadata?.payment_kind === "commerce" &&
        session.metadata.commerce_order_id
      ) {
        const admin = getSupabaseAdminClient();

        if (admin) {
          await admin
            .from("commerce_orders")
            .update({
              payment_provider: "stripe",
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              payment_status: paid ? "paid" : "pending",
              status: paid ? "paid" : "checkout_created",
              paid_at: paid ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.metadata.commerce_order_id);
        }
      }
    } catch (error) {
      console.error("Stripe order reconciliation failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "4rem 1.5rem",
      }}
    >
      <section
        style={{
          width: "min(680px, 100%)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          House of Denise
        </p>

        <h1>
          {paid
            ? "Thank you for your order"
            : "We're confirming your payment"}
        </h1>

        <p>
          {paid
            ? "Your Stripe payment was received successfully."
            : "Payment confirmation can take a moment. Please keep your order reference."}
        </p>

        {reference ? (
          <p>
            <strong>Reference:</strong> {reference}
          </p>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "2rem",
          }}
        >
          <Link href="/shop">Continue shopping</Link>
          <Link href="/">Return home</Link>
        </div>
      </section>
    </main>
  );
}
