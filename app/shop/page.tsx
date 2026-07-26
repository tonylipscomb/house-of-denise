import Link from "next/link";
import { connection } from "next/server";
import { StorefrontGrid } from "@/components/commerce/StorefrontGrid";
import { listCommerceItems } from "@/lib/commerce/catalog";

export default async function ShopPage() {
  await connection();

  const items = await listCommerceItems();

  return (
    <main
      style={{
        minHeight: "75vh",
        padding: "4rem 1.5rem",
        background:
          "linear-gradient(180deg,#fbf7f3 0%,#f4ece6 100%)",
      }}
    >
      <div
        style={{
          width: "min(1180px,100%)",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <div>
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
              Shop & Experiences
            </h1>

            <p style={{ maxWidth: "680px", lineHeight: 1.7 }}>
              Explore available products, workshops, experiences, and
              event deposits managed directly by House of Denise.
            </p>
          </div>

          <Link
            href="/cart"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".5rem",
              border: "1px solid rgba(25,19,16,.2)",
              borderRadius: "999px",
              padding: ".8rem 1rem",
              textDecoration: "none",
              color: "inherit",
              background: "#fff",
            }}
          >
            View cart
          </Link>
        </header>

        <StorefrontGrid items={items} />
      </div>
    </main>
  );
}
