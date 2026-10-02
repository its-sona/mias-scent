import { NextResponse, type NextRequest } from "next/server";
import {
  OAUTH_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  cookieOptions,
  seal,
  unseal,
  type SessionUser,
} from "@/lib/session";

type OAuthCookie = { state: string; codeVerifier: string; next: string };

type GoogleIdToken = {
  iss: string;
  aud: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  exp: number;
};

// Step 2 of Google sign-in: Google sends the user back here with a one-time code.
// We exchange it for the user's identity and start a session.
export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url);
  const fail = (reason: string) => {
    console.error("Google sign-in failed:", reason);
    const response = NextResponse.redirect(`${origin}/login?error=auth`);
    response.cookies.delete(OAUTH_COOKIE);
    return response;
  };

  const saved = unseal<OAuthCookie>(request.cookies.get(OAUTH_COOKIE)?.value);
  const code = searchParams.get("code");
  if (!saved || !code || searchParams.get("state") !== saved.state) {
    return fail(searchParams.get("error") ?? "missing code or state mismatch");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/auth/google/callback`,
      grant_type: "authorization_code",
      code_verifier: saved.codeVerifier,
    }),
  });
  if (!tokenResponse.ok) {
    return fail(`token exchange ${tokenResponse.status}: ${await tokenResponse.text()}`);
  }

  // The ID token came straight from Google over HTTPS in exchange for our client
  // secret, so we can read it directly; we still check who it was issued for.
  const { id_token } = (await tokenResponse.json()) as { id_token?: string };
  let profile: GoogleIdToken;
  try {
    profile = JSON.parse(Buffer.from(id_token!.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return fail("could not read id_token");
  }

  const validIssuer = ["accounts.google.com", "https://accounts.google.com"].includes(profile.iss);
  if (
    !validIssuer ||
    profile.aud !== process.env.GOOGLE_CLIENT_ID ||
    profile.exp < Date.now() / 1000 ||
    !profile.email ||
    !profile.email_verified
  ) {
    return fail("id_token checks failed");
  }

  const user: SessionUser = {
    sub: profile.sub,
    email: profile.email,
    name: profile.name ?? profile.email,
    picture: profile.picture,
  };

  const response = NextResponse.redirect(`${origin}${saved.next}`);
  response.cookies.set(SESSION_COOKIE, seal(user, SESSION_MAX_AGE), {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE,
  });
  response.cookies.delete(OAUTH_COOKIE);
  return response;
}
