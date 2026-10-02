import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = safeNextPath(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(nextPath);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-serif text-4xl">Welcome to Mia&apos;s Scent</h1>
      <p className="mt-3 text-mocha">
        Sign in with your Google account to check out and see your orders.
      </p>
      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          We couldn&apos;t sign you in. Please try again.
        </p>
      )}
      <div className="mt-8">
        <GoogleSignInButton next={nextPath} />
      </div>
    </div>
  );
}
