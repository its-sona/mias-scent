# Mia's Scent

An individual HNG Lesson 2 shop project for **Mia's Scent** — *Elegance in every drop.* The project will grow in phases into a fragrance storefront with Google sign-in, simulated checkout, Supabase order history, and Mailgun email receipts.

## Current phase

Phase 1: project setup. The current homepage is a small branded placeholder; shopping and integrations are planned for later phases.

## Requirements

- Node.js 20.9 or newer
- pnpm (the project uses pnpm)

## Run locally

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

When service integrations are added in later phases, copy `.env.example` to `.env.local` and fill in the values in your own environment. Never commit `.env.local` or share private credentials in chat.

## Project context

- `AGENTS.md` contains instructions for coding agents.
- `PROJECT_STATUS.md` records decisions and current progress.
- `docs/implementation/` contains the agreed phase plans.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, Google OAuth, Mailgun, and Vercel.
