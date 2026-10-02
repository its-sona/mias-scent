"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export function AddToCartButton({ productId, name }: { productId: string; name: string }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        add(productId);
        setAdded(true);
      }}
      aria-label={`Add ${name} to cart`}
      className="w-full rounded-full bg-espresso px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-mocha"
    >
      <span aria-live="polite">{added ? "Added to cart ✓" : "Add to cart"}</span>
    </button>
  );
}
