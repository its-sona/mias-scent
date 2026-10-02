"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { MAX_QUANTITY } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";

export function CartView() {
  const { items, total, setQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-blush/50">
        <p className="text-mocha">Your cart is empty.</p>
        <Link
          href="/#shop"
          className="mt-6 inline-block rounded-full bg-espresso px-6 py-2.5 text-cream hover:bg-mocha"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <ul className="divide-y divide-blush/60 rounded-2xl bg-white ring-1 ring-blush/50">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand">
              <Image src={item.product.image} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg">{item.product.name}</p>
              <p className="text-sm text-taupe">{formatNaira(item.product.price)} each</p>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="mt-1 text-sm text-mocha underline hover:text-espresso"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(item.id, item.quantity - 1)}
                aria-label={`Decrease ${item.product.name} quantity`}
                className="size-8 rounded-full border border-espresso/20 hover:border-espresso"
              >
                −
              </button>
              <span className="w-6 text-center" aria-label={`Quantity ${item.quantity}`}>
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= MAX_QUANTITY}
                aria-label={`Increase ${item.product.name} quantity`}
                className="size-8 rounded-full border border-espresso/20 hover:border-espresso disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="hidden w-28 text-right font-medium sm:block">
              {formatNaira(item.lineTotal)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-end gap-4">
        <p className="text-lg">
          Total: <span className="font-semibold">{formatNaira(total)}</span>
        </p>
        <Link
          href="/checkout"
          className="rounded-full bg-espresso px-8 py-3 text-cream hover:bg-mocha"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
