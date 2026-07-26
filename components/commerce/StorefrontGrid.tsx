import type { CommerceItem } from "@/lib/commerce/catalog-types";
import { AddToCartButton } from "./AddToCartButton";

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function StorefrontGrid({
  items,
}: {
  items: CommerceItem[];
}) {
  if (items.length === 0) {
    return (
      <section
        style={{
          padding: "3rem",
          textAlign: "center",
          border: "1px solid rgba(25,19,16,.12)",
          borderRadius: "1rem",
          background: "rgba(255,255,255,.72)",
        }}
      >
        <h2>New offerings are being prepared</h2>
        <p>Please check back soon.</p>
      </section>
    );
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
        gap: "1.5rem",
      }}
    >
      {items.map((item) => (
        <article
          key={item.id}
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgba(25,19,16,.12)",
            borderRadius: "1rem",
            background: "#fff",
            boxShadow: "0 18px 45px rgba(25,19,16,.08)",
          }}
        >
          <div
            style={{
              aspectRatio: "4 / 3",
              background:
                "linear-gradient(135deg,#efe4dc,#d8c1b3)",
              overflow: "hidden",
            }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: "0.8rem",
              padding: "1.25rem",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 .35rem",
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  fontSize: ".72rem",
                }}
              >
                {item.itemType}
              </p>

              <h2 style={{ margin: 0 }}>{item.name}</h2>
            </div>

            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {item.description}
            </p>

            <p
              style={{
                margin: "auto 0 0",
                fontSize: "1.2rem",
                fontWeight: 800,
              }}
            >
              {money(item.priceInCents)}
            </p>

            <AddToCartButton
              item={{
                itemId: item.id,
                slug: item.slug,
                name: item.name,
                priceInCents: item.priceInCents,
                image: item.image,
                itemType: item.itemType,
                fulfillmentType: item.fulfillmentType,
                maxPerOrder: item.inventory.maxPerOrder,
              }}
            />
          </div>
        </article>
      ))}
    </section>
  );
}
