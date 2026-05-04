# Database Foundation Design

## Context

DevStash currently has UI scaffolding only. This feature adds the first database foundation using Prisma 7 with Neon PostgreSQL so later auth and app CRUD features can build on a stable schema and migration workflow.

## Goals

- Add Prisma 7 to the project with config aligned to current Prisma 7 conventions.
- Configure Prisma for Neon PostgreSQL using migration-driven workflow.
- Create the initial application schema from the current project overview.
- Include NextAuth-required database models in the first migration.
- Add appropriate indexes and foreign key delete behavior.
- Add a shared Prisma client helper for Next.js server-side usage.
- Update `context/current-feature.md` to reflect this feature.

## Non-Goals

- No seed script or seed data in this feature.
- No NextAuth runtime wiring or adapter setup yet.
- No CRUD pages, server actions, or API routes.
- No UI changes.
- No direct schema pushes with `prisma db push`.

## Chosen Approach

Use a normalized Prisma schema with row-backed item types.

This keeps the schema aligned with the existing project overview, supports global built-in item types immediately, and preserves a clean path for later user-defined custom item types without redesigning the `Item` model. Built-in item types will be stored as global `ItemType` rows with `isSystem = true`. Seed data is intentionally deferred; this feature only establishes the schema and migration.

## Alternatives Considered

### 1. Enum-backed built-in item types

This would make the first migration slightly smaller, but it conflicts with the planned custom item type capability and would likely force a near-term redesign.

### 2. Auth-only schema first

This would reduce initial scope but would not satisfy the feature requirement to establish the initial app data model from the project overview.

## Architecture

The feature will add:

- `prisma.config.ts` for Prisma 7 configuration and datasource URL resolution
- `prisma/schema.prisma` for the database schema
- `prisma/migrations/...` for the initial migration generated via `prisma migrate dev`
- `src/lib/prisma.ts` for a shared Prisma client singleton in Next.js

Prisma 7 moves configuration responsibility into `prisma.config.ts`, so environment loading should happen there instead of depending on older CLI behavior from previous Prisma versions.

The Prisma client should use the standard Next.js singleton pattern so development hot reload does not create unnecessary clients.

## Data Model

### User

Fields:

- `id`
- `email`
- `passwordHash`
- `isPro`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `createdAt`
- `updatedAt`

Relations:

- `items`
- `collections`
- `tags`
- `itemTypes`
- `accounts`
- `sessions`

`passwordHash` is included now so credentials auth can be added later without another immediate user-table migration.

### ItemType

Fields:

- `id`
- `name`
- `icon`
- `color`
- `isSystem`
- `userId` nullable

Relations:

- `user`
- `items`

Design intent:

- Global built-in item types use `isSystem = true` and `userId = NULL`.
- Future custom item types use `isSystem = false` and `userId = <owner>`.

### Item

Fields:

- `id`
- `title`
- `contentType`
- `content`
- `fileUrl`
- `fileName`
- `fileSize`
- `url`
- `description`
- `isFavorite`
- `isPinned`
- `language`
- `userId`
- `typeId`
- `collectionId` nullable
- `createdAt`
- `updatedAt`

Relations:

- `user`
- `type`
- `collection`
- `tags`

`contentType` stays in the first schema because the current domain model already distinguishes text and file-backed item content.

### Collection

Fields:

- `id`
- `name`
- `description`
- `isFavorite`
- `userId`
- `createdAt`
- `updatedAt`

Relations:

- `user`
- `items`

### Tag

Fields:

- `id`
- `name`
- `userId`

Relations:

- `user`
- `items`

### ItemTag

Fields:

- `itemId`
- `tagId`

Relations:

- `item`
- `tag`

Primary key:

- composite key on `itemId` and `tagId`

### NextAuth Models

Include:

- `Account`
- `Session`
- `VerificationToken`

These should follow current NextAuth-compatible relational modeling for Prisma and reference `User` with cascading delete behavior where appropriate.

## Constraints And Indexes

Required unique constraints:

- `User.email`
- `VerificationToken` composite uniqueness per NextAuth requirements

Required indexes:

- `Item.userId`
- `Item.typeId`
- `Item.collectionId`
- `Collection.userId`
- `Tag.userId`
- `Account.userId`
- `Session.userId`
- `Item(userId, updatedAt)`
- `Item(userId, isPinned)`
- `Item(userId, isFavorite)`

`ItemType` should be designed so the model can later enforce one global system row per name and prevent duplicate custom type names per user. If Prisma/Postgres partial uniqueness is awkward in the first migration, the first implementation may use a simpler uniqueness strategy that preserves the current direction without overcomplicating the setup.

## Delete Behavior

Use cascading deletes for records that are purely owned children:

- deleting a `User` deletes owned `Item`, `Collection`, `Tag`, custom `ItemType`, `Account`, and `Session` rows
- deleting an `Item` deletes related `ItemTag` rows
- deleting a `Tag` deletes related `ItemTag` rows

Use nullable unlinking where child data should survive:

- deleting a `Collection` sets `Item.collectionId` to `NULL`

Global system `ItemType` rows are not user-owned and should not be modeled as user children.

## Operational Rules

- Use Neon PostgreSQL as the datasource.
- Use `DATABASE_URL` for the development Neon branch.
- Always create migrations with `prisma migrate dev`.
- Never use `prisma db push` for this feature.
- Production should later use migration deployment workflow, not direct schema mutation.

## Verification

Before the feature is considered complete, verify:

- Prisma schema validates
- Prisma client generates successfully
- initial migration is created successfully
- `pnpm build` passes
- `context/current-feature.md` is updated and marked completed only after verification passes

## Implementation Notes

- Keep the first change set minimal and focused on database foundation only.
- Preserve the current rough domain model unless a Prisma 7 or Postgres constraint requires a small adjustment.
- Do not introduce app-level abstractions beyond a shared Prisma client helper.

## Open Decisions Resolved

- Scope: foundation only
- Credentials path: include `passwordHash` now
- Built-in item types: global system rows
