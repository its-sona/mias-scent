"use server";

import { getProduct, MAX_QUANTITY } from "@/lib/catalog";
import { sendOrderConfirmation } from "@/lib/mailgun";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "address", string>>;
  orderId?: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,18}[0-9]$/;

function parseItems(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null;

  // Merge duplicate lines and look every product up in the trusted catalog.
  const quantities = new Map<string, number>();
  for (const line of value) {
    const id = line?.id;
    const quantity = line?.quantity;
    if (typeof id !== "string" || !getProduct(id)) return null;
    if (!Number.isInteger(quantity) || quantity < 1) return null;
    quantities.set(id, (quantities.get(id) ?? 0) + quantity);
  }

  const items = [];
  for (const [id, quantity] of quantities) {
    if (quantity > MAX_QUANTITY) return null;
    const product = getProduct(id)!;
    items.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity,
      line_total: product.price * quantity,
    });
  }
  return items;
}

export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  // 1. Confirm who is signed in, on the server.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "Your session has expired. Please sign in again." };
  }

  // 2. Validate the delivery details.
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const fieldErrors: CheckoutState["fieldErrors"] = {};
  if (name.length < 2 || name.length > 80) fieldErrors.name = "Enter your full name.";
  if (!PHONE_PATTERN.test(phone)) fieldErrors.phone = "Enter a valid phone number, e.g. 0803 123 4567.";
  if (address.length < 10 || address.length > 300) {
    fieldErrors.address = "Enter your full delivery address (at least 10 characters).";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // 3. Rebuild the order from the catalog — never trust prices from the browser.
  const items = parseItems(formData.get("items"));
  if (!items) return { error: "Your cart looks invalid. Please review it and try again." };
  const total = items.reduce((sum, item) => sum + item.line_total, 0);

  const requestId = String(formData.get("requestId") ?? "");
  if (!UUID_PATTERN.test(requestId)) return { error: "Something went wrong. Please try again." };

  const admin = createAdminClient();

  // 4. If this exact checkout was already submitted (double click / retry), reuse it.
  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("client_request_id", requestId)
    .maybeSingle();
  if (existing) return { orderId: existing.id };

  // 5. Save the order, then its line items.
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      client_request_id: requestId,
      customer_name: name,
      phone,
      address,
      email: user.email,
      total,
    })
    .select("id, created_at")
    .single();

  if (orderError || !order) {
    // 23505 = unique violation: a parallel submit already created this order.
    if (orderError?.code === "23505") {
      const { data: duplicate } = await admin
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("client_request_id", requestId)
        .single();
      if (duplicate) return { orderId: duplicate.id };
    }
    console.error("Order insert failed:", orderError);
    return { error: "We couldn't place your order. Please try again." };
  }

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    console.error("Order items insert failed:", itemsError);
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "We couldn't place your order. Please try again." };
  }

  // 6. The order is saved. Now send the email; a failure here does not undo the order.
  const sent = await sendOrderConfirmation({
    id: order.id,
    created_at: order.created_at,
    customer_name: name,
    phone,
    address,
    email: user.email,
    total,
    items,
  });
  await admin
    .from("orders")
    .update({ email_status: sent ? "sent" : "failed" })
    .eq("id", order.id);

  return { orderId: order.id };
}
