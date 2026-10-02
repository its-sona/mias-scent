import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartLink } from "@/components/cart-link";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.full_name ?? user?.email;

  return (
    <header className="sticky top-0 z-20 border-b border-blush/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          Mia&apos;s Scent
        </Link>

        <nav aria-label="Main" className="flex items-center gap-3 text-sm sm:gap-5">
          <Link href="/#shop" className="hidden hover:text-gold sm:inline">
            Shop
          </Link>
          {user && (
            <Link href="/orders" className="hover:text-gold">
              My orders
            </Link>
          )}
          <CartLink />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-40 truncate text-taupe md:inline" title={user.email}>
                {displayName}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-espresso/20 px-3 py-1.5 hover:border-espresso"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-espresso px-4 py-1.5 text-cream hover:bg-mocha"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
