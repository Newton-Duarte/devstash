# Current Feature: Rate Limiting for Auth

## Status

In Progress

## Goals

- Add rate limiting to auth-related API routes to reduce brute force and abuse risk.
- Use Upstash Redis with `@upstash/ratelimit` through a reusable `src/lib/rate-limit.ts` utility.
- Apply the specified per-endpoint limits for login, register, forgot-password, reset-password, and resend-verification flows.
- Return proper `429 Too Many Requests` responses with `Retry-After` headers and user-friendly error messages.
- Surface rate-limit failures to users through frontend toast messaging.

## Notes

- Protect these endpoints with the requested limits:
  - `/api/auth/callback/credentials`: 5 attempts per 15 minutes, keyed by IP + email.
  - `/api/auth/register`: 3 attempts per 1 hour, keyed by IP.
  - `/api/auth/forgot-password`: 3 attempts per 1 hour, keyed by IP.
  - `/api/auth/reset-password`: 5 attempts per 15 minutes, keyed by IP.
  - `/api/auth/resend-verification`: 3 attempts per 15 minutes, keyed by IP + email.
- Use a sliding window algorithm.
- Extract IP from `x-forwarded-for` when available.
- Rate limiting should fail open if Upstash is unavailable.
- Expected environment variables:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Login protection may require special handling because credentials auth flows through NextAuth.
- A shared middleware-style abstraction can be considered later, but this feature should focus on the current endpoints.

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
- **Dashboard UI Phase 3** - Dashboard stats, recent collections, pinned items, and recent items completed (Completed)
- **Database Foundation** - Prisma 7, Neon PostgreSQL config, initial schema, shared Prisma client, and first migration completed (Completed)
- **Seed Data** - Prisma seed script, demo user, system item types, collections, and sample items completed (Completed)
- **Dashboard Collections** - Dashboard recent collections now load from Prisma with derived type colors, icons, and collection stats (Completed)
- **Dashboard Items** - Dashboard pinned and recent items now load from Prisma with item-type accents, icons, and item stats (Completed)
- **Stats And Sidebar** - Dashboard sidebar item types and collection lists now load from Prisma with plural item routes, recent collection color indicators, and view-all collections link (Completed)
- **Add Pro Badge To Sidebar** - Added subtle uppercase PRO badges to the Files and Images sidebar item types using a reusable ShadCN-style badge component (Completed)
- **Auth Setup - NextAuth + GitHub Provider** - Added Auth.js v5 split config, Prisma-backed sessions, GitHub sign-in, and `/dashboard` proxy protection (Completed)
- **Auth Credentials - Email/Password Provider** - Added email/password registration, bcrypt-validated credentials sign-in, and Auth.js Credentials support while preserving GitHub OAuth (Completed)
- **Auth UI - Sign In, Register & Sign Out** - Replaced the default Auth.js pages with custom sign-in and register flows, added a reusable authenticated avatar menu, and wired dashboard/profile auth UI to the real session user (Completed)
- **Setup Email Verification On Register** - Added Resend-backed email verification, link-based verification and resend flows, and blocked credentials sign-in until email verification is complete while preserving GitHub OAuth (Completed)
- **Add Configurable Email Verification Toggle** - Added an environment-driven email verification toggle so credentials registration/sign-in can bypass verification when disabled while preserving the Resend verification flow when enabled (Completed)
- **Create Forgot Password Flow** - Added forgot-password and reset-password flows backed by `VerificationToken`, reset email delivery, password reset completion, and auth hardening for trusted email origins and session invalidation after reset (Completed)
- **Profile Page** - Added a protected profile route with account details, usage stats, inline password changes for credentials users, and permanent account deletion with confirmation (Completed)
