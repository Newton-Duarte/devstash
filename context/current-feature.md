# Current Feature

Auth Setup - NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install `next-auth@beta` and `@auth/prisma-adapter`
- Set up the split auth config pattern for edge compatibility
- Add the GitHub OAuth provider
- Protect `/dashboard/*` routes using Next.js 16 proxy
- Redirect unauthenticated users to the default NextAuth sign-in page
- Verify `/dashboard` redirects to sign-in and returns to `/dashboard` after GitHub auth

## Notes

- Source spec: `context/features/auth-phase-1-spec.md`
- Files expected: `src/auth.config.ts`, `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts`, and `src/types/next-auth.d.ts`
- Use Context7 to verify the latest NextAuth v5 config and conventions before implementation
- Use `next-auth@beta`, not `@latest`
- Keep the proxy file at `src/proxy.ts` and use `export const proxy = auth(...)`
- Use JWT session strategy with the split config pattern
- Do not configure a custom `pages.signIn`; use the default NextAuth sign-in page
- Required environment variables: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

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
