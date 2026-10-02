import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { OAUTH_COOKIE, cookieOptions, seal } from "@/lib/session";

// Step 1 of Google sign-in: send the user to Google's consent screen.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const next = safeNextPath(searchParams.get("next"));

  // `state` protects against forged callbacks; PKCE protects the code exchange.
  const state = randomBytes(16).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${origin}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
  response.cookies.set(OAUTH_COOKIE, seal({ state, codeVerifier, next }, 600), {
    ...cookieOptions,
    maxAge: 600,
  });
  return response;
}
