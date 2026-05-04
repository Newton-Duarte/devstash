# Seed Data Design

## Context

DevStash now has its first Prisma schema and shared Prisma client, but the development database still needs realistic demo content so later auth, CRUD, search, and UI work can be exercised against meaningful data instead of empty states.

## Goals

- Add a Prisma seed entrypoint at `prisma/seed.ts`.
- Create the demo user `demo@devstash.io` with the specified hashed password and metadata.
- Seed the seven global system item types with the provided names, Lucide icon names, and colors.
- Seed the requested collections and sample items across snippets, prompts, commands, and links.
- Add the package script required to run the seed flow locally.
- Update `context/current-feature.md` to reflect this feature.

## Non-Goals

- No schema changes or new migrations.
- No auth runtime wiring or login UI.
- No seed idempotency, duplicate protection, or reset behavior.
- No unit tests for the seed script in this feature.
- No additional demo users or expanded sample content beyond the current spec.

## Chosen Approach

Use a single static TypeScript seed script.

`prisma/seed.ts` will contain a typed in-file representation of the demo content and create rows in dependency order using the existing shared Prisma setup patterns as reference. This is the smallest correct approach for a fixed seed dataset, keeps the logic readable in one place, and avoids introducing extra seed-data modules or JSON parsing before the project has a demonstrated need for them.

## Alternatives Considered

### 1. Split seed content into a separate data module

This would separate static content from insertion logic, but it adds another file and abstraction layer without enough complexity to justify it yet.

### 2. JSON-driven seed files

This could make non-code content editing easier, but relation wiring, typing, and future refactors become less direct. It is unnecessary for the current fixed demo dataset.

## Architecture

The feature will add or update:

- `prisma/seed.ts` for the seed entrypoint
- `package.json` for a seed script and dependency updates
- `context/current-feature.md` for feature tracking

The seed script should:

- instantiate Prisma using the generated Prisma client
- hash the demo password with `bcryptjs` using 12 rounds
- create the demo user first
- create global system `ItemType` rows with `isSystem = true` and `userId = NULL`
- create collections and tags owned by the demo user
- create items linked to the correct type and collection
- create item-tag relations after items exist

The implementation should remain fail-fast and fresh-database oriented. It should not attempt to detect or reconcile existing seed data.

## Seeded Records

### User

Create one user with:

- `email = demo@devstash.io`
- `name = Demo User`
- `passwordHash = bcryptjs hash of 12345678 using 12 rounds`
- `isPro = false`
- `emailVerified = current date`

### System Item Types

Create these global system item types:

- `snippet` / `Code` / `#3b82f6`
- `prompt` / `Sparkles` / `#8b5cf6`
- `command` / `Terminal` / `#f97316`
- `note` / `StickyNote` / `#fde047`
- `file` / `File` / `#6b7280`
- `image` / `Image` / `#ec4899`
- `link` / `Link` / `#10b981`

### Collections

Create these collections for the demo user:

- `React Patterns` with description `Reusable React patterns and hooks`
- `AI Workflows` with description `AI prompts and workflow automations`
- `DevOps` with description `Infrastructure and deployment resources`
- `Terminal Commands` with description `Useful shell commands for everyday development`
- `Design Resources` with description `UI/UX resources and references`

### Items

Seed the requested content counts:

- `React Patterns`: 3 snippet items
- `AI Workflows`: 3 prompt items
- `DevOps`: 1 snippet, 1 command, 2 link items
- `Terminal Commands`: 4 command items
- `Design Resources`: 4 link items

Item content should be realistic but compact. Use `contentType = "text"` for snippets, prompts, and commands. Use `contentType = "link"` and store the actual destination in `url` for link items. Snippet content should be TypeScript or config text matching the collection theme. Link items must use real URLs.

### Tags

Add a small set of tags to improve later search and filtering coverage. Tags are not explicitly mandated by the seed spec, but they are part of the existing schema and are useful development data.

Recommended tag themes:

- React and hooks tags for `React Patterns`
- AI or workflow tags for `AI Workflows`
- Docker, CI/CD, or deployment tags for `DevOps`
- shell or tooling tags for `Terminal Commands`
- design, CSS, components, or icons tags for `Design Resources`

## Data Flow

Create records in this order:

1. user
2. item types
3. collections
4. tags
5. items
6. item-tag join rows

This order matches foreign key dependencies and keeps the script simple.

## Error Handling

The script should:

- log a concise success message on completion
- log the thrown error on failure
- always disconnect Prisma in a `finally` block
- exit with a non-zero status when seeding fails

Because the feature assumes a fresh database, the script should not include preflight checks for duplicate demo data and should not try to recover from uniqueness conflicts.

## Operational Rules

- Assume `DATABASE_URL` points at the development Neon branch.
- Do not change the schema as part of this feature.
- Keep the seed script minimal and focused on development/demo data only.
- Prefer direct Prisma `create` calls over abstractions unless relation wiring becomes unclear.

## Verification

Before the feature is considered complete, verify:

- the seed script runs successfully against the configured development database
- the expected user, item types, collections, and items are present after seeding
- `pnpm lint` passes
- `pnpm build` passes
- `context/current-feature.md` is updated and marked completed only after verification passes

## Open Decisions Resolved

- Database assumption: fresh development database only
- Seed organization: single static seed script
- Duplicate handling: out of scope
- Password hashing: `bcryptjs` with 12 rounds
