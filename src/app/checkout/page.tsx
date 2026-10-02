import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout — Mia's Scent" };

export default async function CheckoutPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/checkout");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Checkout</h1>
      <CheckoutForm
        email={user.email}
        defaultName={user.name === user.email ? "" : user.name}
      />
    </div>
  );
}
