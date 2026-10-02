# Setup guide: Supabase database, Google sign-in, Mailgun and Vercel

Follow these steps in order. They take about 30 minutes. Keep a private notes file for the
values you copy. **Never commit them or paste them in chat.**

You will end up with these values for `.env.local` (and for Vercel):

| Variable | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Supabase → Connect → Transaction pooler connection string |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth client |
| `AUTH_SECRET` | A random string you generate (step 3) |
| `MAILGUN_API_KEY` | Mailgun → API key |
| `MAILGUN_DOMAIN` | Mailgun → sandbox domain (`sandboxXXXX.mailgun.org`) |
| `MAILGUN_FROM_EMAIL` | `Mia's Scent <postmaster@sandboxXXXX.mailgun.org>` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your Vercel URL in production |

---

## 1. Supabase (database)

1. Go to <https://supabase.com>, sign in, and click **New project**. Name it `mias-scent`,
   set a **database password** (save it), choose the closest region, and click **Create**.
2. Create the tables: open **SQL Editor** → **New query**. Paste the whole content of
   [`supabase/schema.sql`](../supabase/schema.sql), then click **Run**. You should see "Success".
3. Get the connection string: click the **Connect** button at the top of the dashboard →
   **Connection String** tab → choose **Transaction pooler** (port **6543**) → copy the URI.
   It looks like:
   `postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
   - Replace `[YOUR-PASSWORD]` (including the brackets) with your database password. This is `DATABASE_URL`.
   - Use the **Transaction pooler**, not "Direct connection". The direct connection doesn't work from Vercel.
   - If your password contains special characters like `@ # / ?`, either reset it to letters and
     numbers only (Project Settings → Database → Reset password) or URL-encode those characters.

## 2. Google Cloud Console (Google sign-in)

1. Go to <https://console.cloud.google.com>. In the project picker at the top, choose
   **New project**, name it `Mias Scent`, then select it.
2. Search for **Google Auth Platform** (it may be called **OAuth consent screen**) and click **Get started**:
   - App name: `Mia's Scent`. User support email: your email.
   - Audience: **External**.
   - Contact email: your email. Agree and **Create**.
3. Under **Audience**: while the app is in "Testing" mode, only the **Test users** you add can
   sign in. Add your email and your friend's. If anyone should be able to sign in (for example
   the HNG reviewers), click **Publish app**.
4. Open **Clients** → **Create client**:
   - Application type: **Web application**. Name: `Mia's Scent web`.
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`
   - Click **Create**, then copy the **Client ID** → `GOOGLE_CLIENT_ID` and the
     **Client secret** → `GOOGLE_CLIENT_SECRET`.
   - You will add the Vercel URLs in step 6.

## 3. AUTH_SECRET (signs the login cookie)

Run this once in a terminal and paste the output into `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## 4. Mailgun (order confirmation emails)

1. Sign up at <https://www.mailgun.com> (the free plan is enough). Mailgun creates a
   **sandbox domain** like `sandbox1234abcd.mailgun.org`. Find it under **Send → Sending → Domains**.
   This is `MAILGUN_DOMAIN`.
2. **Authorized recipients:** the sandbox can only send to addresses you approve. Open the
   sandbox domain → **Authorized recipients** and add your Google email and your friend's.
   Each person must click **I agree** in the email Mailgun sends them.
3. **API key:** profile menu (top right) → **API Security** (or **API keys**) → **Add new key**.
   Copy it into `MAILGUN_API_KEY`.
4. `MAILGUN_FROM_EMAIL` = `Mia's Scent <postmaster@sandbox1234abcd.mailgun.org>` (use your sandbox domain).
5. If your account is in the **EU** region, also set `MAILGUN_API_BASE=https://api.eu.mailgun.net`.

## 5. Run it locally

```bash
pnpm install
cp .env.example .env.local   # then open .env.local and fill in every value
pnpm dev
```

Open <http://localhost:3000> and test the flow in step 7.

## 6. Deploy to Vercel

1. Go to <https://vercel.com/new> and import the `its-sona/mias-scent` GitHub repository.
2. Before clicking Deploy, open **Environment Variables** and add **all** the variables from
   `.env.local`. Set `NEXT_PUBLIC_SITE_URL` to the URL Vercel will give you, e.g.
   `https://mias-scent.vercel.app`.
3. Click **Deploy** and note the final URL. If it differs from what you guessed, update
   `NEXT_PUBLIC_SITE_URL` in Vercel and **Redeploy**.
4. Back in **Google Cloud Console → Clients → your client**, add:
   - Authorized JavaScript origins: `https://YOUR-APP.vercel.app`
   - Authorized redirect URIs: `https://YOUR-APP.vercel.app/auth/google/callback`

   Save. It can take a few minutes for Google to apply the change.

## 7. Final test checklist (do this on the Vercel URL)

- [ ] Home page shows 10 products (5 essentials + 5 bundles) with ₦ prices.
- [ ] Add items, change quantities, and refresh. The cart is still there.
- [ ] Click **Proceed to checkout**. You are asked to sign in with Google.
- [ ] Sign in, fill in name / phone / address, and click **Place order**. The receipt page opens.
- [ ] The confirmation email arrives (check spam too).
- [ ] In Supabase **Table Editor**, the order is in `orders` and its lines are in `order_items`.
- [ ] Sign out, close the browser, open the site again, and sign in. **My orders** still shows the order.

## Troubleshooting

- **Google "Error 400: redirect_uri_mismatch":** the redirect URI in Google must be exactly
  `https://YOUR-APP.vercel.app/auth/google/callback` (or the localhost one). No trailing slash.
- **"Access blocked: app is in testing":** add that Google account as a test user, or publish the app.
- **"We couldn't sign you in":** check `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and
  `AUTH_SECRET` in Vercel. The Vercel **Logs** show "Google sign-in failed: …" with the reason.
- **"We couldn't place your order" or orders don't load:** check `DATABASE_URL` (Transaction
  pooler, port 6543, real password) and that `schema.sql` ran. The Vercel Logs show the exact error.
- **Order saved but "couldn't send the confirmation email":** the recipient isn't an authorized
  recipient in the Mailgun sandbox, or the Mailgun variables are wrong. Look for
  "Mailgun send failed" in the Vercel Logs.
