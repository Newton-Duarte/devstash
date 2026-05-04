# Current Feature

Seed Data - add a Prisma seed script that populates the development database with a demo user, system item types, collections, and sample items.

## Status

Completed

## Goals

- Add `prisma/seed.ts` to populate the development database with sample data.
- Create the demo user `demo@devstash.io` with a bcrypt-hashed password.
- Seed the seven built-in system item types with Lucide icon names and colors.
- Seed the requested collections, items, and real reference links for development and demos.
- Add the package script needed to run the Prisma seed flow locally.
- Keep this feature limited to seed data only, assuming a fresh development database.

## Notes

- Assume a fresh development database; the seed script does not need idempotent upsert behavior.
- Hash the demo password with `bcryptjs` using 12 rounds.
- System item types remain global rows with `isSystem: true` and `userId: null`.
- Use compact but realistic sample content so future UI, auth, and search work has useful data to exercise.
- Feature spec: `@context/features/seed-spec.md`.
- Design spec: `@docs/superpowers/specs/2026-05-04-seed-data-design.md`.

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
- **Dashboard UI Phase 3** - Dashboard stats, recent collections, pinned items, and recent items completed (Completed)
- **Database Foundation** - Prisma 7, Neon PostgreSQL config, initial schema, shared Prisma client, and first migration completed (Completed)
- **Seed Data** - Prisma seed script, demo user, system item types, collections, and sample items completed (Completed)
