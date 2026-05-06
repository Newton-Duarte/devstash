# Auth UI - Sign In, Register & Sign Out

## Status

Complete

## Goals

- Replace the default Auth.js pages with custom `/sign-in` and `/register` pages.
- Add sign-in UI with email/password inputs, GitHub sign-in, validation, error display, and a link to register.
- Add register UI with name, email, password, and confirm password fields that submit to `/api/auth/register` and redirect to `/sign-in` on success.
- Update the bottom of the dashboard sidebar to show the signed-in user's avatar, name, and sign-out access.
- Support avatar images from GitHub with initials fallback for users without an image.

## Notes

- Sidebar user avatar should use the user's `image` when available.
- When no `image` exists, render initials derived from the user's name.
- Create a reusable avatar component that handles both image and initials states.
- Avatar interaction needs to support both navigation to `/profile` and access to a sign-out action.
- Verify the full flows for custom sign-in, GitHub sign-in, credentials sign-in, register success redirect, avatar display, and sign-out redirect.

## History

- **Auth UI - Sign In, Register & Sign Out** - Replaced the default Auth.js pages with custom sign-in and register flows, added a reusable authenticated avatar menu, and wired dashboard/profile auth UI to the real session user (Completed)
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
