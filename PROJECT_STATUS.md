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

## Progress

- Requirements clarified and Stage 1 finalized.
- Stage 2 project plan confirmed and locked.
- Stage 3 phase structure (above) confirmed.
- `AGENTS.md` and this status file established.
- Phase 1 scaffold, branded landing placeholder, README, `.env.example`, and `.gitignore` created.
- Dependency installation completed and lint passed.
- Project files copied into the dedicated folder above; the original workspace copy remains intact.
- Dependencies installed and lint passed from the dedicated folder.
- Git initialized on `main`; initial commit `7bf1bf1` was created with the user's supplied author identity. `origin` points to `https://github.com/its-sona/mias-scent.git`.
- Push was attempted but blocked because this environment has no GitHub credentials available to Git (`SEC_E_NO_CREDENTIALS`). The user must authenticate Git locally and push `main`.
- GitHub and Vercel accounts are connected by the user; repository push and Vercel project import for automatic deployments remain pending.
- Next.js cannot start in this environment: spawning its server process returns `EPERM` even from the dedicated folder. This was retried during Phase 2 and reproduced.
- Phase 2 storefront/catalog implementation is in progress. The user supplied product and bundle photos/prices, and approved clearly labeled demo prices for atomizer and diffuser items.
- Storefront changes committed locally (`feat: add storefront`). Push attempts to `origin/main` failed because this environment has no GitHub credentials (`SEC_E_NO_CREDENTIALS`); no Vercel deployment has been created yet.
- **Current phase:** Phase 2 — Storefront and catalog (in progress; awaiting visual review and completion of checks).
- **Completed phases:** None.

## Phase 1 target

Create the Next.js App Router project in the agreed workspace, establish its initial structure and safe environment-variable template, initialize Git, create/connect the GitHub repository as appropriate, and confirm the app can start locally. Do not implement storefront features or integrate external services during setup.

## Important implementation notes

- Keep private credentials server-side; commit only placeholder variable names in `.env.example`.
- Verify production OAuth redirect settings and production environment variables during deployment.
- Validate user identity and order totals server-side; scope database access to the authenticated owner.
- Persist the order before attempting email delivery so an email error cannot lose an order.
- The product catalog can begin as trusted application data; persist customer orders and line items in Supabase.

## Known issues and remaining work

- Next.js development server startup is blocked by the environment's process-spawn restriction, including from the dedicated folder.
- GitHub push is not complete because local Git has no usable GitHub authentication; Vercel is connected to the user's account but has not imported this project.
- The Supabase project, Google Cloud OAuth configuration, and Mailgun account/domain remain to be set up by the user in their respective phases.
- Atomizer (₦3,000) and diffuser (₦8,000) have demo prices chosen with user approval; replace if actual prices differ. Bundle contents are not itemized; current names are storefront labels for the supplied price tiers.
- Exact production OAuth URLs and environment variable values depend on the eventual deployment and account setup.
- The HNG submission form details are not recorded here yet.

## Verification record

- `pnpm install` completed.
- `pnpm lint` passed.
- `pnpm dev` was attempted but could not start: the environment returned `EPERM` while Next.js tried to spawn its server process.
- `pnpm dev` was attempted from the dedicated folder and failed with `EPERM` when Next.js tried to spawn its server child process.
- Git initialized on `main`; initial commit `7bf1bf1` exists and `origin` is configured. Push failed for lack of GitHub credentials.
- Phase 2 plan and selected product data are recorded in `docs/implementation/02-storefront-and-catalog.md`.
- Phase 2 TypeScript check (`tsc --noEmit`) and ESLint passed. A production build was started but did not return within the environment's execution window and was interrupted. Visual browser review has not been completed.
- Retried `next dev --hostname 127.0.0.1 --port 3000`; it failed with `spawn EPERM` before the server became available, so browser verification could not run.

## Next action

Have the user review the Phase 2 storefront from their local terminal, where Next.js child processes may be permitted. Confirm the demo prices and bundle contents before launch. After the user reviews and approves Phase 2, begin Phase 3: Google sign-in and Supabase setup. GitHub push/Vercel import for Phase 1 remain pending separately.
