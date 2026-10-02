import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNaira, orderNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Order details — Mia's Scent" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orders/${encodeURIComponent(id)}`);

  // RLS returns nothing if this order belongs to someone else.
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, created_at, customer_name, phone, address, email, total, email_status, order_items(id, product_name, unit_price, quantity, line_total)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {placed && (
        <div role="status" className="mb-8 rounded-2xl bg-white p-6 ring-1 ring-gold/40">
          <p className="font-serif text-2xl">Thank you for your order!</p>
          {order.email_status === "sent" ? (
            <p className="mt-2 text-mocha">
              A confirmation email has been sent to <strong>{order.email}</strong>.
            </p>
          ) : (
            <p className="mt-2 text-mocha">
              Your order is saved, but we couldn&apos;t send the confirmation email right now. You
              can always find this receipt under My orders.
            </p>
          )}
        </div>
      )}

      <Link href="/orders" className="text-sm text-mocha underline">
        ← All orders
      </Link>
      <h1 className="mt-3 font-serif text-4xl">Order {orderNumber(order.id)}</h1>
      <p className="mt-1 text-taupe">Placed {formatDate(order.created_at)}</p>

      <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-blush/50">
        <h2 className="font-serif text-2xl">Items</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.product_name} × {item.quantity}{" "}
                <span className="text-taupe">({formatNaira(item.unit_price)} each)</span>
              </span>
              <span className="shrink-0">{formatNaira(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-blush/60 pt-4 font-semibold">
          <span>Total</span>
          <span>{formatNaira(order.total)}</span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-blush/50">
        <h2 className="font-serif text-2xl">Delivery details</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mocha">
          {order.customer_name}
          {"\n"}
          {order.phone}
          {"\n"}
          {order.address}
        </p>
      </section>
    </div>
  );
}
