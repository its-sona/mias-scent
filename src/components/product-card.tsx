import Image from "next/image";
import type { Product } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blush/50">
      <div className="relative aspect-square overflow-hidden bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.kind === "bundle" && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-medium text-white">
            Bundle deal
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-xl">{product.name}</h3>
        <p className="text-sm text-mocha">{product.description}</p>
        {product.includes && (
          <p className="text-xs text-taupe">Includes: {product.includes.join(" + ")}</p>
        )}
        <div className="mt-auto pt-3">
          <p className="mb-3 text-lg font-semibold">{formatNaira(product.price)}</p>
          <AddToCartButton productId={product.id} name={product.name} />
        </div>
      </div>
    </article>
  );
}
