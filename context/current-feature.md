# Current Feature

Database Foundation - set up Prisma 7 with Neon PostgreSQL, create the initial schema and migration, and add a shared Prisma client.

## Status

Completed

## Goals

- Add Prisma 7 to the project using current Prisma 7 configuration patterns.
- Configure Neon PostgreSQL as the datasource for migrations and runtime access.
- Create the initial schema for users, item types, items, collections, tags, item tags, and NextAuth tables.
- Add appropriate indexes and delete behavior for the first schema.
- Add a shared Prisma client helper for Next.js server-side usage.
- Keep this feature limited to database foundation only, without auth wiring or seed data.

## Notes

- Always create migrations with `prisma migrate dev`; do not use `prisma db push`.
- Use the development Neon branch in `DATABASE_URL`.
- Built-in item types will be modeled as global system rows.
- Include `passwordHash` on `User` now for later credentials auth.
- Feature spec: `@context/features/database-spec.md`.
- Design spec: `@docs/superpowers/specs/2026-05-04-database-foundation-design.md`.

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
- **Dashboard UI Phase 3** - Dashboard stats, recent collections, pinned items, and recent items completed (Completed)
- **Database Foundation** - Prisma 7, Neon PostgreSQL config, initial schema, shared Prisma client, and first migration completed (Completed)
