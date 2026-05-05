# Current Feature

Add Pro Badge To Sidebar - add a subtle PRO badge to the Files and Images item types in the dashboard sidebar.

## Status

In Progress

## Goals

- Add a ShadCN `Badge` to the `Files` sidebar item.
- Add a ShadCN `Badge` to the `Images` sidebar item.
- Render the badge text as `PRO` in uppercase.
- Keep the badge styling clean and subtle within the existing sidebar layout.

## Notes

- Limit changes to the dashboard sidebar item-type list.
- Preserve the current routes, counts, icons, and overall sidebar structure.
- Feature spec: `@context/features/add-pro-badge-sidebar.md`.

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
