import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-3 text-mocha">We couldn&apos;t find what you were looking for.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-espresso px-6 py-2.5 text-cream hover:bg-mocha"
      >
        Back to the shop
      </Link>
    </div>
  );
}
