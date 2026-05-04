# Dashboard Collections Design

## Context

The dashboard UI already has a polished Recent Collections section, but it still renders mock collection data from `src/lib/mock-data.ts`. The database and seed data are now in place, so this feature moves the main dashboard collection cards onto real Prisma-backed data without changing the established layout.

## Goals

- Add `src/lib/db/collections.ts` for dashboard-specific collection queries.
- Replace mock recent collection card data in the dashboard main area with Prisma data.
- Derive each collection card accent color from the most-used item type in that collection.
- Show small icons for the actual item types present in each collection.
- Update collection-related dashboard stats to use database-backed counts.
- Update `context/current-feature.md` to reflect this feature.

## Non-Goals

- No collection detail page or item list under each collection card yet.
- No auth integration or user session lookup.
- No changes to sidebar mock collections, pinned items, or recent items.
- No new loading skeletons, client fetch flows, or server actions.
- No schema or migration changes.

## Chosen Approach

Use a small database mapping layer plus server-side dashboard data injection.

The dashboard route should fetch recent collections at the server boundary, shape the result into a collection-card view model in `src/lib/db/collections.ts`, and pass that data into the existing dashboard UI. This keeps Prisma and aggregation logic out of the presentation components while preserving the current visual design.

## Alternatives Considered

### 1. Query directly inside `DashboardShell`

This would reduce file count slightly, but `DashboardShell` is already a large layout component and would become responsible for Prisma querying, aggregation, and UI state at the same time.

### 2. Let the collection card compute everything from nested Prisma data

This would keep the fetch code thin but would move domain logic such as accent selection and icon deduplication into a presentational component that should stay mostly render-only.

## Architecture

The feature will add or update:

- `src/lib/db/collections.ts` for dashboard collection queries and mapping
- `src/app/dashboard/page.tsx` as the server boundary that loads dashboard collection data
- `src/components/dashboard/dashboard-shell.tsx` to accept real collection and stats props instead of sourcing mock collections internally
- `src/components/dashboard/dashboard-collection-card.tsx` to render database-backed collection metadata
- `context/current-feature.md` for feature tracking

The route-level data flow should be:

1. `src/app/dashboard/page.tsx` fetches recent dashboard collections and collection-related stats on the server.
2. The page passes that data into `DashboardShell`.
3. `DashboardShell` renders the existing layout using real collection data for the Recent Collections section.
4. `DashboardCollectionCard` receives a ready-to-render collection view model with accent color, type icons, and counts already derived.

## Data Source Strategy

Because authentication is not wired yet, the dashboard should target the seeded demo user for now. The collection query should look up the user by `demo@devstash.io` and return an empty collection result if that user does not exist.

This avoids inventing temporary auth plumbing while keeping the database-backed dashboard behavior aligned with the seeded development environment.

## Query Shape

`src/lib/db/collections.ts` should expose one focused function for the dashboard recent collections section and a compact dashboard-specific return type.

The mapped collection shape should include:

- `id`
- `name`
- `description`
- `isFavorite`
- `itemCount`
- `accentColor`
- `types`

Each type entry should include only the fields needed for card rendering, such as:

- `name`
- `icon`
- `color`

The Prisma query should:

- fetch recent collections for the demo user
- order by recency using collection `updatedAt` descending
- limit to 6 collections to preserve the current section size
- include `_count` for item totals
- include related items and their `type` relation so type frequency and unique icon sets can be derived

## Derived UI Rules

### Accent Color

The collection card left border color should come from the most-used item type in the collection.

Algorithm:

1. Count items per `ItemType` within the collection.
2. Select the type with the highest count.
3. If counts tie, choose deterministically by descending count and then ascending type name.
4. Use that type's `color` as the accent.
5. If the collection has zero items or the type lacks a color, use a neutral fallback accent.

### Type Icons

The card should render the unique set of item types present in the collection, based only on items currently assigned to that collection.

Rules:

- deduplicate repeated item types
- keep deterministic ordering
- use actual `ItemType.icon` and `ItemType.color` data
- do not invent icons for empty collections

### Stats

This feature should update only the stats that are naturally tied to the collection query:

- total collections
- favorite collections

The existing item-related stats can remain unchanged until those sections are migrated off mock data in a later feature.

## Component Responsibilities

### `src/lib/db/collections.ts`

- query Prisma
- isolate demo-user lookup
- map raw database rows into dashboard collection view models
- compute accent colors and unique type icon metadata
- provide collection-related stats needed by the dashboard

### `src/app/dashboard/page.tsx`

- remain a server component
- fetch dashboard collection data directly
- pass that data into the shell component

### `DashboardShell`

- keep mobile drawer and sidebar UI behavior
- stop importing `mockCollections` for the recent collections section
- render the collection cards from server-provided props
- update collection-related stat cards from server-provided values

### `DashboardCollectionCard`

- render the same visual layout already established
- stop depending on `MockCollection` and hardcoded icon/accent arrays
- consume already-derived accent color, item count, and type icon data

## Error Handling

- If the demo user is missing, return an empty collections result and zeroed collection stats rather than crashing the page.
- If the Prisma query itself fails, let the server-rendered route fail normally rather than silently swapping back to mock data.
- Do not add a separate client error state or loading state in this feature.

## Verification

Before the feature is considered complete, verify:

- `pnpm lint` passes
- `pnpm build` passes
- the dashboard renders recent collections from the database instead of `mockCollections`
- collection accent colors reflect the most-used item type in each collection
- the row of type icons reflects the actual item types present in each collection
- the collection-related stats reflect database counts
- `context/current-feature.md` is marked completed only after verification passes

## Open Decisions Resolved

- Data owner before auth: use the seeded demo user
- Empty collections: neutral accent and no fabricated icons
- Scope boundary: recent collections section and collection stats only
- Fetching model: server-rendered Prisma query with a small DB mapping layer
