# Mia's Scent — Project Status

## Goal

Deliver the individual HNG Lesson 2 shop task: a polished shop for **Mia's Scent** (“Elegance in every drop.”) with Google sign-in, a simulated checkout, Supabase-persisted orders, Mailgun confirmation email, and a Vercel deployment.

## Locked scope and decisions

- **Experience level:** Beginner; explain unfamiliar steps plainly.
- **Stack:** Next.js/React App Router, Supabase PostgreSQL and Supabase Auth, Google OAuth 2.0 configured through Google Cloud Console, Mailgun REST API sandbox, and Vercel.
- **Catalog:** Exactly ten initial items: five single products (perfume, body mist, perfume oil, atomizer, diffuser) plus five combo/bundle deals. Use supplied photos when available and Unsplash-hosted photos for missing product types.
- **Currency:** Nigerian naira (₦).
- **Checkout:** Simulated “Place Order”; collect customer name, phone, and delivery address. No shipping fees, tracking, or payment processing in the HNG task.
- **Order persistence:** Save orders and order items in Supabase for the authenticated customer. Orders must remain available after logout, closing/reopening the site, and signing in again.
- **Email:** Send a formatted receipt to the signed-in customer's Google email after saving the order. Development uses Mailgun sandbox; the user will authorize their and their friend's recipient addresses.
- **Post-submission:** Paystack or Flutterwave may be considered for a later business-launch phase; no gateway is selected or in scope now.
- **Accounts:** GitHub and Vercel are connected by the user. The user still needs guided setup for Supabase, Google Cloud OAuth, and Mailgun.
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
- **Google sign-in:** Supabase Auth with the Google provider (`/login`, `/auth/callback`, `/auth/signout`, session refreshed in `src/proxy.ts`).
- **Database:** `supabase/schema.sql` creates `orders` and `order_items` with RLS (customers can only read their own orders; only the server writes, using the service-role key).
- **Cart and checkout:** a localStorage cart; the checkout server action validates input, recomputes totals from the catalog, and blocks duplicate submits with a request ID.
- **Order history:** `/orders` and `/orders/[id]`.
- **Email:** a Mailgun REST receipt is sent after the order is saved; `email_status` records sent/failed.

**Current phase:** Phase 8/9 — the user must configure Supabase, Google Cloud, Mailgun and Vercel (see `docs/SETUP.md`), then run the end-to-end checklist.

## Verification record

- `tsc --noEmit`, `eslint` and `next build` pass.
- Smoke test with placeholder Supabase values: `/`, `/cart` and `/login` return 200; `/checkout`, `/orders` and `/orders/[id]` redirect to login when signed out; sign-out returns 303 to `/`; the homepage renders all 10 ₦ prices; a visual screenshot was checked.
- **Not yet verified** (needs real credentials): Google sign-in, order insert, RLS reads, and Mailgun delivery.

## Next action

Follow `docs/SETUP.md` sections 1–6, deploy on Vercel, run the test checklist, then submit the Vercel URL and GitHub repo on the HNG form before 11:59 PM WAT.
