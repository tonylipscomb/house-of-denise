import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "4rem 1.5rem" }}>
      <section style={{ width: "min(680px, 100%)", textAlign: "center" }}>
        <p style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>House of Denise</p>
        <h1>Checkout was not completed</h1>
        <p>
          No completed payment was confirmed. Your selections may still be
          available in your cart.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          <Link href="/cart">Return to cart</Link>
          <Link href="/shop">Continue shopping</Link>
        </div>
      </section>
    </main>
  );
}
