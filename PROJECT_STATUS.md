# Mia's Scent — Project Status

## Goal

Deliver the individual HNG Lesson 2 shop task: a polished shop for **Mia's Scent** (“Elegance in every drop.”) with Google sign-in, a simulated checkout, Supabase-persisted orders, Mailgun confirmation email, and a Vercel deployment.

## Locked scope and decisions

- **Experience level:** Beginner; explain unfamiliar steps plainly.
- **Stack:** Next.js/React App Router, Supabase PostgreSQL via connection string, Google OAuth 2.0 implemented directly with the user's Google Cloud Console client (no Supabase Auth), Mailgun REST API sandbox, and Vercel.
- **Catalog:** Exactly ten initial items: five single products (perfume, body mist, perfume oil, atomizer, diffuser) plus five combo/bundle deals. Use supplied photos when available and Unsplash-hosted photos for missing product types.
- **Currency:** Nigerian naira (₦).
- **Checkout:** Simulated “Place Order”; collect customer name, phone, and delivery address. No shipping fees, tracking, or payment processing in the HNG task.
- **Order persistence:** Save orders and order items in Supabase for the authenticated customer. Orders must remain available after logout, closing/reopening the site, and signing in again.
- **Email:** Send a formatted receipt to the signed-in customer's Google email after saving the order. Development uses Mailgun sandbox; the user will authorize their and their friend's recipient addresses.
- **Post-submission:** Paystack or Flutterwave may be considered for a later business-launch phase; no gateway is selected or in scope now.
- **Accounts:** GitHub and Vercel are connected by the user. The user still needs guided setup for Supabase, Google Cloud OAuth, and Mailgun.
- **Change (2026-10-02):** At the user's request, Supabase Auth was dropped. The app now connects to Supabase Postgres with `DATABASE_URL` and implements Google OAuth itself (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`).
- **Starting point:** No application starter or GitHub repository existed when planning began. The dedicated project folder is `C:\Users\User\Documents\Codex\mias-scent`; the original workspace copy remains as a backup.
- **Deadline:** Friday, October 2, 2026, 11:59 PM WAT (Africa/Lagos).
- **Submission:** User has the official HNG form link; obtain it when preparing final submission.

## Agreed implementation phases

1. Project setup
2. Storefront and catalog
3. Google sign-in and Supabase setup
4. Order database and access rules
5. Cart and simulated checkout
6. Order history and persistence
7. Mailgun confirmation email
8. End-to-end verification and polish
9. Deployment and submission

## Progress (updated 2026-10-02)

The original storefront commit never reached GitHub (only config files were uploaded), so the
app was rebuilt in this repository and Phases 2–7 were implemented together because of the deadline:

- **Storefront/catalog:** 10 items (5 singles + 5 bundles) in `src/lib/catalog.ts`, ₦ prices, Unsplash images. Demo prices are used for all items, including the atomizer (₦3,000) and diffuser (₦8,000); replace them with real prices if needed.
- **Google sign-in:** direct Google OAuth (authorization code + state + PKCE) at `/auth/google` → `/auth/google/callback`; HMAC-signed HTTP-only session cookie (30 days); `/auth/signout`.
- **Database:** `supabase/schema.sql` creates `orders` (keyed to the Google `sub`) and `order_items`. The app connects with `DATABASE_URL` (`postgres` driver); every query filters by the signed-in user. RLS is enabled with no policies, which blocks the public REST API.
- **Cart and checkout:** a localStorage cart; the checkout server action validates input, recomputes totals from the catalog, saves the order and its items in one transaction, and uses `on conflict` with a request ID to block duplicate submits.
- **Order history:** `/orders` and `/orders/[id]` (404 for other users' orders).
- **Email:** a Mailgun REST receipt is sent after the order is saved; `email_status` records sent/failed.

**Current phase:** Phase 8/9 — the user must configure the Supabase database, Google Cloud OAuth client, Mailgun and Vercel (see `docs/SETUP.md`), then run the end-to-end checklist.

## Verification record

- `tsc --noEmit`, `eslint` and `next build` pass.
- End-to-end test against a local Postgres 16 (Docker) loaded with `schema.sql`, driving headless Edge with a test-signed session cookie:
  - field validation errors show; a double-clicked "Place order" created exactly one order;
  - the order and items were saved with server-computed totals (₦34,500), the cart was cleared, and the receipt page rendered;
  - with no Mailgun configured, `email_status` became `failed` and the order was kept;
  - `/orders` lists the order; a second user gets a 404 on it and sees an empty list; a tampered cookie redirects to login.
- `/auth/google` redirects to Google with state + PKCE; a callback with a bad state redirects to `/login?error=auth`.
- **Not yet verified** (needs real credentials): the real Google consent round-trip, the Supabase pooler connection, and Mailgun delivery.

## Next action

Follow `docs/SETUP.md` sections 1–7, deploy on Vercel, run the test checklist, then submit the Vercel URL and GitHub repo on the HNG form before 11:59 PM WAT.
