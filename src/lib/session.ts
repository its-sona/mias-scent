import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Simple signed-cookie sessions. The cookie holds the Google user's details plus
// an HMAC signature made with AUTH_SECRET, so it can't be forged or edited.

export type SessionUser = {
  sub: string; // Google's stable user ID
  email: string;
  name: string;
  picture?: string;
};

export const SESSION_COOKIE = "ms_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
// Short-lived cookie holding the OAuth state while the user is at Google.
export const OAUTH_COOKIE = "ms_oauth";

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return value;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

// Encodes any JSON value into a tamper-proof string: "<data>.<signature>".
export function seal(value: object, maxAgeSeconds: number): string {
  const data = Buffer.from(
    JSON.stringify({ ...value, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds }),
  ).toString("base64url");
  return `${data}.${sign(data)}`;
}

// Returns the decoded value, or null if the signature is wrong or it has expired.
export function unseal<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const value = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof value.exp !== "number" || value.exp < Date.now() / 1000) return null;
    return value as T;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// The signed-in user for the current request, or null.
export async function getUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = unseal<SessionUser>(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  return { sub: session.sub, email: session.email, name: session.name, picture: session.picture };
}
