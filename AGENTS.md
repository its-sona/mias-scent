# Mia's Scent — Agent Instructions

## Project purpose

Build a beginner-friendly, individual HNG Lesson 2 shop project for **Mia's Scent**, a beauty, cosmetics, and personal-care shop with the tagline **“Elegance in every drop.”** The HNG version uses a simulated checkout. Real payments are explicitly out of scope until after submission.

## Read before working

Before starting a task or implementation phase:

1. Read this file and `PROJECT_STATUS.md`.
2. Read the implementation plan for the current phase under `docs/implementation/` when one exists.
3. Inspect the current project structure, Git status, relevant source files, and package scripts before editing.
4. Follow established project conventions. Ask for clarification if a requirement conflicts with existing behavior or would require a significant unapproved scope change.

## Locked product requirements

- Build a shop website with a product browsing experience, cart, and functional simulated checkout.
- The initial catalog contains exactly **10 items**: five single products (perfume, body mist, perfume oil, atomizer, diffuser) and five combo/bundle deals.
- Use high-quality stock perfume/product image URLs from Unsplash or Pexels so all ten product cards have imagery. Check URLs during implementation and use stable direct image URLs.
- Display all prices in **Nigerian naira (₦)**.
- Checkout collects the customer's name, phone number, and delivery address. Phase 1 does not calculate shipping fees or provide delivery tracking.
- The “Place Order” action creates a simulated order; do not request or process payment in the HNG submission scope.
- Save orders and their line items in Supabase. A signed-in customer must still see their orders after logging out, closing/reopening the site, and signing in again.
- Send a formatted order confirmation through the Mailgun REST API to the signed-in customer's Google email after the order has been saved. Development uses a Mailgun sandbox domain; the user will add their and their friend's addresses as authorized recipients.
- Phase 2, after HNG submission, may add Paystack or Flutterwave. Do not implement payment integration as part of Phase 1–9.

## Locked technology stack

- Next.js with React and the **App Router**, including server-side/API route functionality where appropriate.
- Supabase PostgreSQL for persistent order data and Supabase Auth for Google OAuth integration.
- Google OAuth 2.0 configured by the user through Google Cloud Console and Supabase.
- Mailgun REST API using a sandbox domain for development email.
- Vercel for deployment.
- Do not replace these choices or add libraries/services without a clear requirement and an explanation of the trade-off.

## Engineering and security rules

- Keep the solution simple and appropriate for a beginner-maintained project.
- Treat browser input as untrusted. Verify the signed-in identity on the server, validate checkout fields, and calculate totals from trusted catalog data on the server. Never trust client-submitted prices or totals.
- Enforce user-scoped order access in Supabase (including Row Level Security policies where appropriate). A customer must not be able to read or alter another customer's order.
- Keep Supabase service-role credentials, Mailgun API keys, OAuth secrets, and other private values on the server in environment variables. Never expose them to client bundles or commit them.
- Provide an `.env.example` containing variable names and safe placeholders only; do not put real credentials in it.
- Save the order before sending its email. Email delivery failure must not delete or undo a successfully saved order; report the email failure clearly and safely.
- Handle duplicate checkout submissions safely to avoid accidental duplicate orders where practical.
- Do not add unrelated features, shipping logic, payment processing, or admin tooling.
- Use accessible labels, keyboard-friendly controls, useful loading/error states, and responsive layouts.

## Work by phase

- Implement only the current agreed phase. Do not begin later phases unless explicitly asked.
- Before implementation, report the plan briefly and note any blockers or assumptions.
- Make focused changes; avoid unrelated formatting or refactors.
- Run appropriate checks for the phase when authorized by the task, and distinguish checks actually run from checks merely recommended. Never claim unperformed verification.
- Do not ask the user to paste credentials into chat. Give click-by-click setup guidance for Supabase, Google Cloud, and Mailgun when those phases arrive; let the user configure secrets locally and in Vercel.
- At phase completion, update `PROJECT_STATUS.md` with the phase state, changes, verification performed, known issues, and next work. Report files changed and checks run in beginner-friendly language.

## Phase overview

1. Project setup
2. Storefront and catalog
3. Google sign-in and Supabase setup
4. Order database and access rules
5. Cart and simulated checkout
6. Order history and persistence
7. Mailgun confirmation email
8. End-to-end verification and polish
9. Deployment and submission
