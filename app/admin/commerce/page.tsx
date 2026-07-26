import { connection } from "next/server";
import {
  archiveCommerceItem,
  createCommerceItem,
  updateCommerceItem,
} from "./actions";
import { requireCommerceAdmin } from "@/lib/commerce/admin-auth";
import { listCommerceItems } from "@/lib/commerce/catalog";

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

const inputStyle = {
  width: "100%",
  padding: "0.7rem",
  border: "1px solid rgba(0,0,0,.18)",
  borderRadius: "0.4rem",
} as const;

const cardStyle = {
  border: "1px solid rgba(0,0,0,.12)",
  borderRadius: "0.75rem",
  padding: "1rem",
  background: "white",
} as const;

export default async function CommerceAdminPage() {
  await connection();
  await requireCommerceAdmin();

  const items = await listCommerceItems({
    includeInactive: true,
  });

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: ".14em" }}>
          House of Denise
        </p>
        <h1>Commerce Listings</h1>
        <p>
          Add, edit, activate, deactivate, and archive products,
          experiences, workshops, and deposits. All checkout prices come
          from these server-managed records.
        </p>
      </header>

      <section style={{ ...cardStyle, marginBottom: "2rem" }}>
        <h2>Add a listing</h2>

        <form action={createCommerceItem} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
            <label>
              Name
              <input name="name" required style={inputStyle} />
            </label>

            <label>
              Slug
              <input name="slug" placeholder="generated-from-name" style={inputStyle} />
            </label>

            <label>
              Price
              <input name="price" type="number" min="0" step="0.01" required style={inputStyle} />
            </label>

            <label>
              Type
              <select name="itemType" defaultValue="product" style={inputStyle}>
                <option value="product">Product</option>
                <option value="experience">Experience</option>
                <option value="workshop">Workshop</option>
                <option value="deposit">Deposit</option>
              </select>
            </label>

            <label>
              Fulfillment
              <select name="fulfillmentType" defaultValue="booking" style={inputStyle}>
                <option value="shipping">Shipping</option>
                <option value="pickup">Pickup</option>
                <option value="booking">Booking</option>
                <option value="digital">Digital</option>
              </select>
            </label>

            <label>
              Maximum per order
              <input name="maxPerOrder" type="number" min="1" max="100" defaultValue="10" style={inputStyle} />
            </label>
          </div>

          <label>
            Description
            <textarea name="description" rows={3} style={inputStyle} />
          </label>

          <label>
            Image URL
            <input name="imageUrl" placeholder="/images/example.jpg" style={inputStyle} />
          </label>

          <label>
            Square catalog variation ID (optional)
            <input name="squareCatalogVariationId" style={inputStyle} />
          </label>

          <label>
            <input name="active" type="checkbox" defaultChecked /> Active
          </label>

          <button type="submit">Add listing</button>
        </form>
      </section>

      <section style={{ display: "grid", gap: "1rem" }}>
        <h2>Current listings</h2>

        {items.length === 0 ? (
          <p>No listings found.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} style={cardStyle}>
              <form action={updateCommerceItem} style={{ display: "grid", gap: "1rem" }}>
                <input type="hidden" name="id" value={item.id} />

                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <strong>{item.name}</strong>
                  <span>{item.active ? "Active" : "Inactive"}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
                  <label>
                    Name
                    <input name="name" defaultValue={item.name} required style={inputStyle} />
                  </label>

                  <label>
                    Slug
                    <input name="slug" defaultValue={item.slug} required style={inputStyle} />
                  </label>

                  <label>
                    Price
                    <input name="price" type="number" min="0" step="0.01" defaultValue={dollars(item.priceInCents)} required style={inputStyle} />
                  </label>

                  <label>
                    Type
                    <select name="itemType" defaultValue={item.itemType} style={inputStyle}>
                      <option value="product">Product</option>
                      <option value="experience">Experience</option>
                      <option value="workshop">Workshop</option>
                      <option value="deposit">Deposit</option>
                    </select>
                  </label>

                  <label>
                    Fulfillment
                    <select name="fulfillmentType" defaultValue={item.fulfillmentType} style={inputStyle}>
                      <option value="shipping">Shipping</option>
                      <option value="pickup">Pickup</option>
                      <option value="booking">Booking</option>
                      <option value="digital">Digital</option>
                    </select>
                  </label>

                  <label>
                    Maximum per order
                    <input name="maxPerOrder" type="number" min="1" max="100" defaultValue={item.inventory.maxPerOrder} style={inputStyle} />
                  </label>
                </div>

                <label>
                  Description
                  <textarea name="description" rows={3} defaultValue={item.description} style={inputStyle} />
                </label>

                <label>
                  Image URL
                  <input name="imageUrl" defaultValue={item.image} style={inputStyle} />
                </label>

                <label>
                  Square catalog variation ID
                  <input name="squareCatalogVariationId" defaultValue={item.squareCatalogVariationId ?? ""} style={inputStyle} />
                </label>

                <label>
                  <input name="active" type="checkbox" defaultChecked={item.active} /> Active
                </label>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button type="submit">Save changes</button>
                </div>
              </form>

              <form action={archiveCommerceItem} style={{ marginTop: "1rem" }}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit">Archive listing</button>
              </form>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
