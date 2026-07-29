"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function CartScreen() {
  const {
    items,
    hydrated,
    subtotalCents,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function beginCheckout() {
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions,
          })),
          customerEmail: customerEmail || undefined,
          customerPhone: customerPhone || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "Checkout could not be started.",
        );
      }

      if (
        typeof result.checkoutUrl !== "string" ||
        !result.checkoutUrl.startsWith("http")
      ) {
        throw new Error("Square did not return a checkout link.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be started.",
      );
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <p>Loading your cart{"\u2026"}</p>;
  }

  if (items.length === 0) {
    return (
      <section
        style={{
          padding: "3rem",
          textAlign: "center",
          borderRadius: "1rem",
          background: "#fff",
          border: "1px solid rgba(25,19,16,.12)",
        }}
      >
        <h2>Your cart is empty</h2>
        <p>Add a product, experience, workshop, or deposit to continue.</p>
        <Link href="/shop">Browse the shop</Link>
      </section>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(0,1.5fr) minmax(280px,.7fr)",
        gap: "2rem",
        alignItems: "start",
      }}
    >
      <section style={{ display: "grid", gap: "1rem" }}>
        {items.map((item) => (
          <article
            key={item.itemId}
            style={{
              display: "grid",
              gridTemplateColumns: "90px minmax(0,1fr)",
              gap: "1rem",
              padding: "1rem",
              borderRadius: "1rem",
              background: "#fff",
              border: "1px solid rgba(25,19,16,.12)",
            }}
          >
            <div
              style={{
                width: "90px",
                aspectRatio: "1",
                overflow: "hidden",
                borderRadius: ".7rem",
                background:
                  "linear-gradient(135deg,#efe4dc,#d8c1b3)",
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

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>{item.name}</h2>
                  <p style={{ margin: ".35rem 0" }}>
                    {money(item.priceInCents)} each
                  </p>
                </div>

                <strong>
                  {money(item.priceInCents * item.quantity)}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".7rem",
                  flexWrap: "wrap",
                  marginTop: "1rem",
                }}
              >
                <label>
                  Quantity{" "}
                  <input
                    type="number"
                    min="1"
                    max={item.maxPerOrder}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(
                        item.itemId,
                        Number(event.target.value),
                      )
                    }
                    style={{
                      width: "4.5rem",
                      padding: ".45rem",
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeItem(item.itemId)}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}

        <button type="button" onClick={clearCart}>
          Clear cart
        </button>
      </section>

      <aside
        style={{
          position: "sticky",
          top: "1.5rem",
          padding: "1.5rem",
          borderRadius: "1rem",
          background: "#fff",
          border: "1px solid rgba(25,19,16,.12)",
        }}
      >
        <h2>Order summary</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem 0",
            borderTop: "1px solid rgba(25,19,16,.12)",
            borderBottom: "1px solid rgba(25,19,16,.12)",
          }}
        >
          <span>Subtotal</span>
          <strong>{money(subtotalCents)}</strong>
        </div>

        <p style={{ fontSize: ".9rem", lineHeight: 1.5 }}>
          The server will verify current listing prices before creating
          the Square checkout.
        </p>

        <label style={{ display: "grid", gap: ".35rem", marginTop: "1rem" }}>
          Email
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="customer@example.com"
            style={{
              width: "100%",
              padding: ".75rem",
              borderRadius: ".5rem",
              border: "1px solid rgba(25,19,16,.2)",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: ".35rem", marginTop: "1rem" }}>
          Phone
          <input
            type="tel"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="804-555-0123"
            style={{
              width: "100%",
              padding: ".75rem",
              borderRadius: ".5rem",
              border: "1px solid rgba(25,19,16,.2)",
            }}
          />
        </label>

        {error ? (
          <p
            role="alert"
            style={{
              color: "#9c1c1c",
              background: "#fff0f0",
              borderRadius: ".5rem",
              padding: ".75rem",
            }}
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          disabled={submitting}
          onClick={beginCheckout}
          style={{
            width: "100%",
            marginTop: "1.25rem",
            border: 0,
            borderRadius: "999px",
            padding: "1rem 1.2rem",
            background: "#191310",
            color: "#fff",
            fontWeight: 800,
            cursor: submitting ? "wait" : "pointer",
            opacity: submitting ? 0.65 : 1,
          }}
        >
          {submitting
            ? `Opening secure checkout${"\u2026"}`
            : "Continue to Square"}
        </button>
      </aside>
    </div>
  );
}

