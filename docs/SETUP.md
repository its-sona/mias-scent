# Setup guide: Supabase, Google sign-in, Mailgun and Vercel

Follow these steps in order. They take about 30–40 minutes. Keep a private notes file
for the values you copy. **Never commit them or paste them in chat.**

You will end up with these values for `.env.local` (and for Vercel):

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → service_role / secret key |
| `MAILGUN_API_KEY` | Mailgun → API key |
| `MAILGUN_DOMAIN` | Mailgun → sandbox domain (`sandboxXXXX.mailgun.org`) |
| `MAILGUN_FROM_EMAIL` | `Mia's Scent <postmaster@sandboxXXXX.mailgun.org>` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your Vercel URL in production |

---

## 1. Supabase (database + sign-in)

1. Go to <https://supabase.com>, sign in, and click **New project**. Pick a name
   (`mias-scent`), set a database password (save it), choose the closest region, and click
   **Create**. Wait for it to finish.
2. Create the tables: in the left menu open **SQL Editor** → **New query**. Paste the whole
   content of [`supabase/schema.sql`](../supabase/schema.sql), then click **Run**. You should
   see "Success". **Table Editor** now shows `orders` and `order_items`.
3. Copy the keys: open **Project Settings** (gear icon) → **API Keys** (and **Data API** for the URL).
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (or the new **publishable** key) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (or the new **secret** key) → `SUPABASE_SERVICE_ROLE_KEY`. Keep this one secret.
4. Copy the Google callback URL: open **Authentication** → **Sign In / Providers** → **Google**.
   Copy the **Callback URL (for OAuth)**. It looks like
   `https://abcdefgh.supabase.co/auth/v1/callback`. Leave this tab open; you will paste the
   Google keys here in step 2.

## 2. Google Cloud Console (Google sign-in)

1. Go to <https://console.cloud.google.com>. In the project picker at the top, choose
   **New project**, name it `Mias Scent`, then select it.
2. Search for **Google Auth Platform** (it may be called **OAuth consent screen**) and click **Get started**:
   - App name: `Mia's Scent`. User support email: your email.
   - Audience: **External**.
   - Contact email: your email. Agree and **Create**.
3. Under **Audience** → **Test users**, add your email and your friend's email. While the
   app is in "Testing" mode, only these accounts can sign in. If anyone should be able to
   sign in (for example the HNG reviewers), click **Publish app** instead.
4. Open **Clients** → **Create client**:
   - Application type: **Web application**. Name: `Mia's Scent web`.
   - **Authorized JavaScript origins**: add `http://localhost:3000` (add your Vercel URL
     later, step 5).
   - **Authorized redirect URIs**: paste the **Supabase callback URL** from 1.4.
   - Click **Create**, then copy the **Client ID** and **Client secret**.
5. Back in Supabase **Authentication → Sign In / Providers → Google**: turn it **on**, paste
   the Client ID and Client secret, and click **Save**.
6. In Supabase **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` for now (change it to the Vercel URL in step 5).
   - **Redirect URLs**: add `http://localhost:3000/**`.

## 3. Mailgun (order confirmation emails)

1. Sign up at <https://www.mailgun.com> (the free plan is enough). Mailgun creates a
   **sandbox domain** like `sandbox1234abcd.mailgun.org`. Find it under **Send → Sending → Domains**.
   This is `MAILGUN_DOMAIN`.
2. **Authorized recipients:** the sandbox can only send to addresses you approve. Open the
   sandbox domain, click **Authorized recipients** (or the *Add recipient* box on the
   overview page), and add your Google email and your friend's. Each person must click
   **I agree** in the confirmation email Mailgun sends.
3. **API key:** click your profile (top right) → **API Security** (or **API keys**) →
   **Add new key**. Copy it into `MAILGUN_API_KEY`.
4. `MAILGUN_FROM_EMAIL` = `Mia's Scent <postmaster@sandbox1234abcd.mailgun.org>` (use your
   sandbox domain).
5. If your account was created in the **EU** region (the dashboard URL contains `eu`), also set
   `MAILGUN_API_BASE=https://api.eu.mailgun.net`.

## 4. Run it locally

```bash
pnpm install
cp .env.example .env.local   # then open .env.local and fill in every value
pnpm dev
```

Open <http://localhost:3000> and test the flow in step 6.

## 5. Deploy to Vercel

1. Go to <https://vercel.com/new> and import the `its-sona/mias-scent` GitHub repository.
2. Before clicking Deploy, open **Environment Variables** and add **all** the variables from
   `.env.local`. For now, set `NEXT_PUBLIC_SITE_URL` to the URL Vercel will give you, e.g.
   `https://mias-scent.vercel.app`.
3. Click **Deploy** and note the final URL. If it differs from what you guessed, update
   `NEXT_PUBLIC_SITE_URL` in Vercel and **Redeploy**.
4. Tell Supabase and Google about the live URL:
   - Supabase **Authentication → URL Configuration**: set **Site URL** to your Vercel URL and
     add `https://YOUR-APP.vercel.app/**` to **Redirect URLs** (keep the localhost one).
   - Google Cloud **Clients → your client → Authorized JavaScript origins**: add
     `https://YOUR-APP.vercel.app`. The redirect URI stays the Supabase one.

## 6. Final test checklist (do this on the Vercel URL)

- [ ] Home page shows 10 products (5 essentials + 5 bundles) with ₦ prices.
- [ ] Add items, change quantities, and refresh. The cart is still there.
- [ ] Click **Proceed to checkout**. You are asked to sign in with Google.
- [ ] Sign in, fill in name / phone / address, and click **Place order**. The receipt page opens.
- [ ] The confirmation email arrives (check spam too).
- [ ] In Supabase **Table Editor**, the order is in `orders` and its lines are in `order_items`.
- [ ] Sign out, close the browser, open the site again, and sign in. **My orders** still shows the order.

## Troubleshooting

- **"redirect_uri_mismatch" from Google:** the redirect URI in Google must be exactly the
  Supabase callback URL (`https://<ref>.supabase.co/auth/v1/callback`).
- **After Google sign-in you land on localhost while on Vercel:** fix **Site URL** and
  **Redirect URLs** in Supabase (step 5.4).
- **"Access blocked: app is in testing":** add that Google account as a test user, or publish the app.
- **Order saved but "couldn't send the confirmation email":** the recipient is not an
  authorized recipient in the Mailgun sandbox, or the Mailgun variables are wrong or missing.
  Check the Vercel **Logs** for the "Mailgun send failed" message.
- **"We couldn't place your order":** check that `schema.sql` ran and that
  `SUPABASE_SERVICE_ROLE_KEY` is set (Vercel → Logs shows the exact error).
