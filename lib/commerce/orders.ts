import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { ResolvedCheckoutLine, CheckoutPayload } from "./checkout";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Supabase order storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createPendingOrder(input: {
  reference: string;
  payload: CheckoutPayload;
  lines: ResolvedCheckoutLine[];
  subtotalCents: number;
}) {
  const supabase = adminClient();

  const { data: order, error } = await supabase
    .from("commerce_orders")
    .insert({
      reference: input.reference,
      customer_email: input.payload.customerEmail ?? null,
      customer_phone: input.payload.customerPhone ?? null,
      status: "pending_checkout",
      payment_status: "unpaid",
      fulfillment_status: "unfulfilled",
      currency: "USD",
      subtotal_cents: input.subtotalCents,
      total_cents: input.subtotalCents,
      fulfillment_type: input.lines[0]?.item.fulfillmentType ?? null,
      fulfillment_details: input.payload.fulfillmentDetails ?? {},
      metadata: {},
    })
    .select("id, reference")
    .single();

  if (error || !order) {
    throw new Error(`Unable to create pending commerce order: ${error?.message ?? "unknown error"}`);
  }

  const items = input.lines.map((line) => ({
    order_id: order.id,
    item_id: line.item.id,
    item_name: line.item.name,
    item_type: line.item.itemType,
    unit_price_cents: line.item.priceInCents,
    quantity: line.quantity,
    line_total_cents: line.lineTotalCents,
    selected_options: line.selectedOptions,
    metadata: {},
  }));

  const { error: itemError } = await supabase
    .from("commerce_order_items")
    .insert(items);

  if (itemError) {
    await supabase
      .from("commerce_orders")
      .update({ status: "checkout_error" })
      .eq("id", order.id);
    throw new Error(`Unable to create commerce order items: ${itemError.message}`);
  }

  return order;
}

export async function attachSquareCheckout(input: {
  orderId: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  squareOrderId: string | null;
}) {
  const supabase = adminClient();
  const { error } = await supabase
    .from("commerce_orders")
    .update({
      status: "checkout_created",
      square_payment_link_id: input.paymentLinkId,
      square_payment_link_url: input.paymentLinkUrl,
      square_order_id: input.squareOrderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);

  if (error) {
    throw new Error(`Unable to attach Square checkout: ${error.message}`);
  }
}

export async function markCheckoutError(orderId: string) {
  const supabase = adminClient();
  await supabase
    .from("commerce_orders")
    .update({
      status: "checkout_error",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
}
