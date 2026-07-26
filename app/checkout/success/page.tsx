import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "4rem 1.5rem" }}>
      <section style={{ width: "min(680px, 100%)", textAlign: "center" }}>
        <p style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>House of Denise</p>
        <h1>Thank you for your order</h1>
        <p>
          Square has returned you to House of Denise. Payment confirmation can
          take a moment, so this page does not by itself confirm that payment
          was completed.
        </p>
        {reference ? <p><strong>Reference:</strong> {reference}</p> : null}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          <Link href="/shop">Continue shopping</Link>
          <Link href="/">Return home</Link>
        </div>
      </section>
    </main>
  );
}
