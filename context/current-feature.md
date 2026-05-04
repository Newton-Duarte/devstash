# Current Feature

Dashboard Collections - replace the dashboard's mock recent collections with database-backed Prisma data from Neon.

## Status

Completed

## Goals

- Create `src/lib/db/collections.ts` with dashboard collection fetching functions.
- Replace the recent collections cards in the dashboard main area with Prisma-backed data.
- Derive each collection card border color from the most-used item type in that collection.
- Show the set of item-type icons actually present in each collection.
- Update collection-related dashboard stats to use real database counts.
- Keep this feature limited to the recent collections section and related stats only.

## Notes

- Fetch collections directly in the server-rendered dashboard path; no client fetch layer for this feature.
- Use the seeded demo user as the temporary dashboard data owner until auth is wired.
- Empty collections should use a neutral accent fallback and no fabricated type icons.
- Leave pinned items, recent items, and sidebar mock data unchanged for now.
- Feature spec: `@context/features/dashboard-collections-spec.md`.
- Design spec: `@docs/superpowers/specs/2026-05-04-dashboard-collections-design.md`.

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
- **Dashboard UI Phase 3** - Dashboard stats, recent collections, pinned items, and recent items completed (Completed)
- **Database Foundation** - Prisma 7, Neon PostgreSQL config, initial schema, shared Prisma client, and first migration completed (Completed)
- **Seed Data** - Prisma seed script, demo user, system item types, collections, and sample items completed (Completed)
- **Dashboard Collections** - Dashboard recent collections now load from Prisma with derived type colors, icons, and collection stats (Completed)
