import Image from "next/image";
import { products } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default function HomePage() {
  const singles = products.filter((product) => product.kind === "single");
  const bundles = products.filter((product) => product.kind === "bundle");

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Fragrance & body care</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">
            Elegance in every drop.
          </h1>
          <p className="mt-5 max-w-md text-lg text-mocha">
            Perfumes, body mists, perfume oils and home fragrance — chosen to make every day feel
            a little more special.
          </p>
          <a
            href="#shop"
            className="mt-8 inline-block rounded-full bg-espresso px-7 py-3 text-cream hover:bg-mocha"
          >
            Shop the collection
          </a>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
          <Image
            src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1200&q=80"
            alt="A collection of perfume bottles in warm light"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-8 sm:px-6">
        <h2 className="font-serif text-3xl">Our essentials</h2>
        <p className="mt-2 text-mocha">Five signature products for you and your home.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {singles.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-serif text-3xl">Bundle deals</h2>
        <p className="mt-2 text-mocha">Better together — and better value.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {bundles.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
