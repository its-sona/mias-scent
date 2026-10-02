import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Your cart — Mia's Scent" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Your cart</h1>
      <CartView />
    </div>
  );
}
