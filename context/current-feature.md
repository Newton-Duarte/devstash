# Current Feature

Stats And Sidebar - replace the dashboard sidebar's mock types and collection lists with database-backed Prisma data while keeping the existing stats and layout intact.

## Status

Completed

## Goals

- Create `src/lib/db/sidebar.ts` with dashboard sidebar fetching functions.
- Replace sidebar system item types and counts with Prisma-backed data.
- Replace sidebar favorite and recent collection lists with Prisma-backed data.
- Keep item type links aligned with current UI-style plural routes like `/items/snippets`.
- Add a `View all collections` link under the sidebar collections list linking to `/collections`.
- Keep star icons for favorite collections.
- Show a colored circle for non-favorite collection rows based on the most-used item type in that collection.
- Preserve the existing DB-backed dashboard stats and current dashboard layout.

## Notes

- Fetch sidebar data directly in the server-rendered dashboard path; no client fetch layer for this feature.
- Use the seeded demo user as the temporary dashboard data owner until auth is wired.
- Keep `src/lib/db/collections.ts` and `src/lib/db/items.ts` as the current stats sources.
- Use a neutral fallback when an item type or dominant collection type lacks color or icon metadata.
- Feature spec: `@context/features/stats-sidebar-spec.md`.

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
