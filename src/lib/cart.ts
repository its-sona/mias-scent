"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getProduct, MAX_QUANTITY, type Product } from "@/lib/catalog";

// The cart lives in the browser's localStorage so it survives page reloads.
// It only stores product IDs and quantities; prices always come from the catalog.

export type CartLine = { id: string; quantity: number };
export type CartItem = CartLine & { product: Product; lineTotal: number };

const STORAGE_KEY = "mias-scent-cart";

const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function writeLines(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage can be unavailable (e.g. private mode); the cart just won't persist.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function parseLines(raw: string): CartLine[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (line): line is CartLine =>
        typeof line?.id === "string" &&
        Number.isInteger(line?.quantity) &&
        line.quantity > 0 &&
        Boolean(getProduct(line.id)),
    );
  } catch {
    return [];
  }
}

export function useCart() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  const lines = useMemo(() => parseLines(raw), [raw]);

  const items: CartItem[] = useMemo(
    () =>
      lines.map((line) => {
        const product = getProduct(line.id)!;
        return { ...line, product, lineTotal: product.price * line.quantity };
      }),
    [lines],
  );

  const add = useCallback((id: string) => {
    const current = parseLines(readRaw());
    const existing = current.find((line) => line.id === id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, MAX_QUANTITY);
    } else {
      current.push({ id, quantity: 1 });
    }
    writeLines(current);
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    const current = parseLines(readRaw());
    writeLines(
      quantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) =>
            line.id === id ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) } : line,
          ),
    );
  }, []);

  const clear = useCallback(() => writeLines([]), []);

  return {
    lines,
    items,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: items.reduce((sum, item) => sum + item.lineTotal, 0),
    add,
    setQuantity,
    remove: (id: string) => setQuantity(id, 0),
    clear,
  };
}
