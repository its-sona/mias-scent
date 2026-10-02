"use server";

import { getProduct, MAX_QUANTITY } from "@/lib/catalog";
import { sendOrderConfirmation } from "@/lib/mailgun";
import { sql } from "@/lib/db";
import { getUser } from "@/lib/session";

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
  const user = await getUser();
  if (!user) {
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

  // 4. Save the order and its items together in one transaction. If this exact
  //    checkout was already submitted (double click / retry), reuse that order.
  let order: { id: string; created_at: Date; isNew: boolean };
  try {
    order = await sql.begin(async (tx) => {
      const [created] = await tx<{ id: string; created_at: Date }[]>`
        insert into orders (user_id, client_request_id, customer_name, phone, address, email, total)
        values (${user.sub}, ${requestId}, ${name}, ${phone}, ${address}, ${user.email}, ${total})
        on conflict (user_id, client_request_id) do nothing
        returning id, created_at
      `;
      if (!created) {
        const [existing] = await tx<{ id: string; created_at: Date }[]>`
          select id, created_at from orders
          where user_id = ${user.sub} and client_request_id = ${requestId}
        `;
        return { ...existing, isNew: false };
      }
      await tx`
        insert into order_items ${tx(
          items.map((item) => ({ ...item, order_id: created.id })),
          "order_id",
          "product_id",
          "product_name",
          "unit_price",
          "quantity",
          "line_total",
        )}
      `;
      return { ...created, isNew: true };
    });
  } catch (error) {
    console.error("Saving order failed:", error);
    return { error: "We couldn't place your order. Please try again." };
  }

  if (!order.isNew) return { orderId: order.id };

  // 5. The order is saved. Now send the email; a failure here does not undo the order.
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
  try {
    await sql`update orders set email_status = ${sent ? "sent" : "failed"} where id = ${order.id}`;
  } catch (error) {
    console.error("Updating email status failed:", error);
  }

  return { orderId: order.id };
}
