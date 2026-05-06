# Current Feature: Setup Email Verification On Register

## Status

In Progress

## Goals

- Send a verification email after a user registers with email and password.
- Require users to verify their email by clicking a link before the account is treated as verified.
- Use Resend for transactional email delivery.
- Keep the existing GitHub OAuth and credentials auth flows working.
- Store and validate verification state securely in the existing auth and database setup.

## Notes

- Users need to click a verification link sent to their email after registering.
- The app is using Resend for email delivery.
- `RESEND_API_KEY` already exists in the local `.env` file.
- Follow the existing NextAuth/Auth.js, Prisma, and Server Action patterns already established in the project.

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
