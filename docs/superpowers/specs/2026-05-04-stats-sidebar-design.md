# Stats And Sidebar Design

## Context

The dashboard main area already uses Prisma-backed data for recent collections and item sections, but the sidebar still renders system item types, collection lists, and counts from `src/lib/mock-data.ts`. This feature finishes that migration by keeping the current dashboard layout while replacing sidebar mock data with database-backed data and ensuring the top stats remain aligned with database counts.

## Goals

- Keep the existing dashboard main-area stats layout and source the displayed counts from database-backed data.
- Replace sidebar system item types and counts with Prisma-backed data.
- Replace sidebar collection lists with Prisma-backed favorite and recent collection data.
- Add a `View all collections` link under the sidebar collections list that routes to `/collections`.
- Keep favorite collections using a star indicator.
- Show a colored circle for non-favorite collection entries based on the most-used item type in that collection.
- Update `context/current-feature.md` to reflect this feature before implementation.
- Create a new feature branch before implementation work begins.

## Non-Goals

- No new collection detail page or item-type pages beyond linking to their existing planned routes.
- No auth integration or session-aware data ownership changes.
- No schema, migration, or seed-data changes.
- No client-side fetch layer, server action, or API route for dashboard data.
- No redesign of the dashboard or sidebar layout.
- No change to the sidebar user profile block unless needed for type safety or prop plumbing.

## Chosen Approach

Use a dedicated sidebar database mapping layer and keep route-level fetching in the server-rendered dashboard page.

`src/app/dashboard/page.tsx` should remain the server boundary that loads all dashboard data in parallel. A new `src/lib/db/sidebar.ts` module should shape sidebar-specific data into render-ready view models so `DashboardShell` and `DashboardSidebar` stay focused on presentation and local UI state.

## Alternatives Considered

### 1. Extend the existing dashboard data pattern

This is the chosen approach. It matches the structure already used by `src/lib/db/collections.ts` and `src/lib/db/items.ts`, keeps Prisma on the server, and requires the fewest conceptual changes to the current dashboard route.

### 2. Merge sidebar queries into `collections.ts` and `items.ts`

This would reduce file count slightly, but it would blur the boundaries between main-content dashboard data and sidebar navigation data. The result would be less clear module ownership and more mixed responsibilities in files that are currently focused.

### 3. Query from inside the client sidebar

This would add unnecessary server/client complexity, move data concerns closer to a client component, and break the current pattern where the dashboard page fetches data directly on the server.

## Architecture

The feature will add or update:

- `src/lib/db/sidebar.ts` for sidebar-specific Prisma queries and mapping
- `src/app/dashboard/page.tsx` to fetch sidebar data in parallel with existing dashboard data
- `src/components/dashboard/dashboard-shell.tsx` to receive sidebar data and pass it into the desktop and mobile sidebar instances
- `src/components/dashboard/dashboard-sidebar.tsx` to render server-provided type and collection data instead of mock data
- `context/current-feature.md` to describe this feature in the active workflow

The route-level data flow should be:

1. `src/app/dashboard/page.tsx` loads dashboard collections, dashboard items, and sidebar data on the server.
2. The page awaits those queries in parallel and passes the results into `DashboardShell`.
3. `DashboardShell` continues to own only client-side layout state such as collapsed sidebar and mobile drawer visibility.
4. `DashboardSidebar` renders from already-mapped sidebar props in both desktop and mobile variants.

## Data Source Strategy

Like the current dashboard collection and item queries, this feature should use the seeded demo user identified by `demo@devstash.io` until auth is wired.

If that user does not exist, the sidebar data layer should return empty arrays and zero counts rather than throwing. This keeps the dashboard render stable in development without introducing temporary auth plumbing.

## Sidebar Query Shape

`src/lib/db/sidebar.ts` should expose one focused function that returns the full sidebar payload needed by `DashboardSidebar`.

The sidebar payload should include:

- `itemTypes`
- `favoriteCollections`
- `recentCollections`
- `viewAllCollectionsHref`

### Item Types

Each item type entry should include only the fields needed for rendering:

- `id`
- `name`
- `icon`
- `color`
- `count`
- `href`

Rules:

- Query only system item types for the demo user context.
- Use actual database counts for each type.
- Build `href` values from the current UI labels, meaning pluralized slugs such as `/items/snippets` and `/items/prompts` rather than raw singular type names.
- Keep deterministic ordering. Prefer an order that matches the current seeded system type list or alphabetical fallback if needed.

### Collections

Each sidebar collection entry should include:

- `id`
- `name`
- `itemCount`
- `isFavorite`
- `accentColor`
- `href`

Rules:

- `favoriteCollections` should contain only favorite collections.
- `recentCollections` should contain the recent non-favorite collection list shown in the general collections section.
- Collection links should keep routing to `/collections/[id]`.
- `viewAllCollectionsHref` should be the static `/collections` route.

## Derived UI Rules

### Collection Accent Color

For non-favorite collection rows, the colored circle should use the most-used item type color within that collection.

Algorithm:

1. Count items per type within the collection.
2. Select the highest-count type.
3. If there is a tie, break it deterministically by ascending type name.
4. Use the chosen type's `color`.
5. If the collection has no items or the winning type has no color, use the same neutral fallback accent used elsewhere for collections.

### Favorite Versus Non-Favorite Indicators

- Favorite collection rows should continue to show the existing star icon.
- Non-favorite rows should show the colored circle instead of a star.
- This rule applies without changing the surrounding spacing or text hierarchy more than necessary.

### Item Type Links

- The text label should remain aligned with the current UI, including pluralized labels.
- The icon color should come from the database when available.
- If an icon or color is missing, fall back to the existing neutral visual behavior instead of failing the render.

## Stats Strategy

The top dashboard stats should continue to render from the already server-fetched dashboard data.

This feature should not invent a second stats source. Instead:

- item totals and favorite item totals continue to come from `src/lib/db/items.ts`
- collection totals and favorite collection totals continue to come from `src/lib/db/collections.ts`

Because those modules already return DB-backed counts, the main work here is preserving that wiring while replacing the remaining sidebar mock data.

## Component Responsibilities

### `src/lib/db/sidebar.ts`

- look up the demo user
- query system item types with counts
- query favorite and recent collections for the sidebar
- derive pluralized UI hrefs for item-type routes
- derive collection accent colors for non-favorite rows
- return a compact render-ready sidebar payload

### `src/app/dashboard/page.tsx`

- remain a server component
- fetch sidebar data alongside existing dashboard collections and items data
- keep server-side parallel fetching
- pass the sidebar payload into `DashboardShell`

### `DashboardShell`

- preserve existing client-side layout behavior
- accept the new sidebar payload as props
- pass those props to both the desktop sidebar and the mobile drawer sidebar
- keep the stats cards sourced from the existing DB-backed dashboard data props

### `DashboardSidebar`

- stop importing sidebar types and collections from `src/lib/mock-data.ts`
- render item types, favorites, recent collections, and the `View all collections` link from props
- preserve collapsed sidebar behavior and mobile rendering
- preserve current link styling and section structure as closely as possible

## Boundaries And Existing Files

The feature spec mentions creating `src/lib/db/items.ts`, but that file already exists from the previous dashboard-items feature. The implementation should treat it as an existing dependency and only modify it if a small change is needed for consistency.

Similarly, `src/lib/db/collections.ts` should remain focused on the main dashboard collections section rather than taking on all sidebar responsibilities.

## Error Handling

- If the demo user is missing, return empty sidebar arrays and preserve zero-safe counts.
- If a type has missing icon or color metadata, use the same fallback icon/color strategy already established in the dashboard.
- If there are no favorite collections or no recent collections, render an empty subsection without replacing it with mock content.
- If Prisma throws, let the server-rendered page fail normally rather than silently reverting to mock data.

## Verification

Before the feature is considered complete, verify:

- `context/current-feature.md` is updated to describe this feature before implementation
- a new branch is created for the feature before implementation changes
- `pnpm build` passes
- the dashboard stats still reflect database counts
- the sidebar item types and counts come from the database
- item type links use pluralized UI slugs such as `/items/snippets`
- favorite collections still show a star icon
- non-favorite collection rows show a color circle based on the most-used item type
- the `View all collections` link appears under the collections list and links to `/collections`
- collapsed desktop and mobile sidebar render paths still work with the new props

## Open Decisions Resolved

- Route slug style: use current UI-aligned plural labels
- Data owner before auth: use the seeded demo user
- Stats source: keep existing DB-backed collection and item stat modules
- Sidebar architecture: new `sidebar.ts` module plus route-level server fetch
