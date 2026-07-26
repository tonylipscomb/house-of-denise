import { CartScreen } from "@/components/commerce/CartScreen";

export default function CartPage() {
  return (
    <main
      style={{
        minHeight: "75vh",
        padding: "4rem 1.5rem",
        background:
          "linear-gradient(180deg,#fbf7f3 0%,#f4ece6 100%)",
      }}
    >
      <div style={{ width: "min(1180px,100%)", margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem" }}>
          <p
            style={{
              margin: "0 0 .5rem",
              textTransform: "uppercase",
              letterSpacing: ".16em",
            }}
          >
            House of Denise
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2.2rem,6vw,4.5rem)",
            }}
          >
            Your Cart
          </h1>
        </header>

        <CartScreen />
      </div>
    </main>
  );
}
