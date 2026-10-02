# Mia's Scent

An HNG Lesson 2 shop project for **Mia's Scent**: *Elegance in every drop.* It is a fragrance
storefront with Google sign-in, a cart, a simulated checkout, orders saved in Supabase, and
order confirmation emails sent through Mailgun.

## Features

- **Storefront:** 10 products (5 essentials + 5 bundle deals), priced in Nigerian naira (₦).
- **Cart:** add, remove and change quantities. Saved in the browser, so it survives a refresh.
- **Google sign-in:** Google OAuth 2.0 (Google Cloud Console) through Supabase Auth.
- **Checkout:** collects name, phone and delivery address. "Place order" is simulated, so no
  payment is taken.
- **Database:** orders and line items are stored in Supabase Postgres. Row Level Security
  means each customer can only see their own orders.
- **Order history:** "My orders" shows every past order, even after signing out and back in.
- **Email:** a formatted receipt is sent to the customer's Google email through the Mailgun REST API.

## How it works

- Prices and totals are calculated **on the server** from the trusted catalog
  ([src/lib/catalog.ts](src/lib/catalog.ts)). Prices sent by the browser are never trusted.
- The checkout server action ([src/app/checkout/actions.ts](src/app/checkout/actions.ts))
  checks the signed-in user and validates the form. It saves the order, **then** sends the
  email, so an email failure never loses an order.
- Each checkout attempt has a unique request ID, so double-clicking "Place order" can't
  create two orders.
- Database schema and access rules: [supabase/schema.sql](supabase/schema.sql).

## Run locally

Requires Node.js 20.9+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # fill in the values; see docs/SETUP.md
pnpm dev
```

Open <http://localhost:3000>.

**First-time setup** (Supabase, Google Cloud OAuth, Mailgun, Vercel): follow
[docs/SETUP.md](docs/SETUP.md) step by step.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) ·
Google OAuth · Mailgun · Vercel
