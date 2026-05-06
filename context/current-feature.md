# Current Feature

Auth Credentials - Email/Password Provider

## Status

Complete

## Goals

- Add Credentials provider for email/password authentication with registration.
- Use `bcryptjs` for password hashing.
- Add a `password` field to the `User` model via migration if needed.
- Update `auth.config.ts` with a Credentials provider placeholder.
- Update `auth.ts` to override Credentials with bcrypt-based validation.
- Create `POST /api/auth/register` for registration.
- Validate `name`, `email`, `password`, and `confirmPassword` in registration.
- Prevent duplicate user registration and return success/error responses.
- Preserve existing GitHub OAuth sign-in flow.

## Notes

- Registration route: `POST /api/auth/register`.
- Registration accepts `name`, `email`, `password`, and `confirmPassword`.
- `auth.config.ts` should keep the split-config placeholder `authorize: () => null`.
- `auth.ts` should provide the real Credentials authorization logic using bcrypt validation.
- Verification flow:
- Test registration with `curl`.
- Test sign-in at `/api/auth/signin` using email/password.
- Verify redirect to `/dashboard` after sign-in.
- Verify GitHub OAuth still works.

## History

- **Auth Credentials - Email/Password Provider** - Added email/password registration, bcrypt-validated credentials sign-in, and Auth.js Credentials support while preserving GitHub OAuth (Completed)
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
