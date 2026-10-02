import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatNaira, orderNumber } from "@/lib/format";

export const metadata: Metadata = { title: "My orders — Mia's Scent" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orders");

  // Row Level Security makes sure only this user's orders come back.
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, created_at, total, order_items(quantity)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">My orders</h1>

      {error && (
        <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          We couldn&apos;t load your orders right now. Please refresh the page.
        </p>
      )}

      {!error && orders?.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-blush/50">
          <p className="text-mocha">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/#shop"
            className="mt-6 inline-block rounded-full bg-espresso px-6 py-2.5 text-cream hover:bg-mocha"
          >
            Start shopping
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="mt-8 divide-y divide-blush/60 rounded-2xl bg-white ring-1 ring-blush/50">
          {orders.map((order) => {
            const count = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 p-5 hover:bg-cream"
                >
                  <div>
                    <p className="font-medium">{orderNumber(order.id)}</p>
                    <p className="text-sm text-taupe">
                      {formatDate(order.created_at)} · {count} {count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <p className="font-semibold">{formatNaira(order.total)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
