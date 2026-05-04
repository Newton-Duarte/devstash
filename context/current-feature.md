# Current Feature

Dashboard Items - replace the dashboard's mock pinned and recent items with database-backed Prisma data from Neon.

## Status

Completed

## Goals

- Create `src/lib/db/items.ts` with dashboard item fetching functions.
- Replace the pinned and recent item cards in the dashboard main area with Prisma-backed data.
- Derive each item card icon and border accent from the item type.
- Keep the item type tag, existing metadata, and current layout styling intact.
- Update item-related dashboard stats to use real database counts.
- Hide the pinned items section when there are no pinned items.

## Notes

- Fetch items directly in the server-rendered dashboard path; no client fetch layer for this feature.
- Use the seeded demo user as the temporary dashboard data owner until auth is wired.
- Use a neutral accent fallback when an item type has no color or icon metadata.
- Leave sidebar mock data unchanged for now.
- Feature spec: `@context/features/dashboard-items-spec.md`.

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
- **Dashboard UI Phase 3** - Dashboard stats, recent collections, pinned items, and recent items completed (Completed)
- **Database Foundation** - Prisma 7, Neon PostgreSQL config, initial schema, shared Prisma client, and first migration completed (Completed)
- **Seed Data** - Prisma seed script, demo user, system item types, collections, and sample items completed (Completed)
- **Dashboard Collections** - Dashboard recent collections now load from Prisma with derived type colors, icons, and collection stats (Completed)
- **Dashboard Items** - Dashboard pinned and recent items now load from Prisma with item-type accents, icons, and item stats (Completed)
