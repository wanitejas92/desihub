# DesiHub

The single place where every South Asian person in the Netherlands finds every
Desi event — and buys the ticket.

A Next.js 15 website and an Expo (React Native) mobile app sharing one Supabase
backend, in a pnpm monorepo.

## Structure

```
apps/
  web/          Next.js 15 (App Router, TypeScript, Tailwind v4)
  mobile/       Expo SDK 52+ (Expo Router, TypeScript, NativeWind)
packages/
  shared/       types, Zod schemas, Supabase client, date & money & season utils
  ui-tokens/    single source of truth for colour, spacing, type scale
  eslint-config/ shared flat ESLint config
supabase/
  migrations/   SQL migrations (RLS + constraints from day one)
  seed.sql      30 realistic NL events across every category and city
docs/
  DECISIONS.md  every architectural choice and why
```

## Prerequisites

- Node ≥ 20.11
- pnpm 10
- (For the full local backend) Docker + the Supabase CLI

## Getting started

```bash
pnpm install

# Backend (needs Docker + Supabase CLI)
supabase start
supabase db reset        # applies migrations + seed.sql

# Web
cp apps/web/.env.example apps/web/.env.local   # fill in Supabase URL + anon key
pnpm --filter @desihub/web dev                 # http://localhost:3000

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
pnpm --filter @desihub/mobile start
```

## Checks

```bash
pnpm typecheck   # tsc --noEmit across the workspace
pnpm lint        # eslint
pnpm test        # vitest
pnpm build       # production build
```

A Husky pre-commit hook runs formatting, typecheck and tests on every commit.

See [`docs/DECISIONS.md`](docs/DECISIONS.md) for the build log and rationale.
