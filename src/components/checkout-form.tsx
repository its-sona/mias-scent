"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { placeOrder, type CheckoutState } from "@/app/checkout/actions";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";

const inputClass =
  "mt-1 w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 outline-none focus:border-gold aria-[invalid=true]:border-red-500";

export function CheckoutForm({ email, defaultName }: { email: string; defaultName: string }) {
  const router = useRouter();
  const { lines, items, total, clear } = useCart();
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, {});
  // One ID per checkout attempt, so a double submit can't create two orders.
  const requestId = useRef<string | null>(null);

  useEffect(() => {
    if (state.orderId) {
      clear();
      router.replace(`/orders/${state.orderId}?placed=1`);
    }
  }, [state.orderId, clear, router]);

  if (state.orderId) {
    return <p className="mt-8 text-mocha">Order placed! Taking you to your receipt…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-10 text-center ring-1 ring-blush/50">
        <p className="text-mocha">Your cart is empty — add something before checking out.</p>
        <Link
          href="/#shop"
          className="mt-6 inline-block rounded-full bg-espresso px-6 py-2.5 text-cream hover:bg-mocha"
        >
          Browse products
        </Link>
      </div>
    );
  }

  function submit(formData: FormData) {
    requestId.current ??= crypto.randomUUID();
    formData.set("requestId", requestId.current);
    formData.set("items", JSON.stringify(lines));
    formAction(formData);
  }

  const errors = state.fieldErrors ?? {};

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1fr_22rem]">
      <form action={submit} className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-blush/50" noValidate>
        <h2 className="font-serif text-2xl">Delivery details</h2>

        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email (receipt will be sent here)
          </label>
          <input id="email" value={email} readOnly className={`${inputClass} bg-sand text-mocha`} />
        </div>

        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            defaultValue={defaultName}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-700">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="0803 123 4567"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={inputClass}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-700">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="text-sm font-medium">
            Delivery address
          </label>
          <textarea
            id="address"
            name="address"
            autoComplete="street-address"
            required
            rows={3}
            placeholder="House number, street, area, city, state"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            className={inputClass}
          />
          {errors.address && (
            <p id="address-error" className="mt-1 text-sm text-red-700">
              {errors.address}
            </p>
          )}
        </div>

        {state.error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-espresso px-6 py-3 font-medium text-cream hover:bg-mocha disabled:opacity-60"
        >
          {pending ? "Placing your order…" : `Place order · ${formatNaira(total)}`}
        </button>
        <p className="text-center text-xs text-taupe">
          Demo checkout — no payment is taken.
        </p>
      </form>

      <aside className="h-fit rounded-2xl bg-white p-6 ring-1 ring-blush/50">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span className="shrink-0">{formatNaira(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-blush/60 pt-4 font-semibold">
          <span>Total</span>
          <span>{formatNaira(total)}</span>
        </div>
        <Link href="/cart" className="mt-4 inline-block text-sm text-mocha underline">
          Edit cart
        </Link>
      </aside>
    </div>
  );
}
