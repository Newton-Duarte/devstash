# Dashboard Phase 3 Design

## Summary

Implement the final dashboard UI slice by filling out the main content area with summary metrics and mock-data-backed sections for collections and items. The work keeps the existing phase 2 shell, sidebar, top bar, and responsive drawer behavior, and focuses only on the right-side dashboard content.

## Chosen Approach

Use the current phase 2 dashboard shell as the base and expand only the main content area.

Why this approach:
- It satisfies the phase 3 spec with the smallest correct change set.
- It preserves the current shell and responsive navigation that already match the prior phases.
- It keeps the feature focused on dashboard content instead of introducing new route structure or editor behavior.

Alternatives considered:
- Rework the dashboard into a denser multi-column overview: rejected because it adds layout interpretation beyond the spec.
- Shift the page to a recent-items-first activity feed: rejected because it conflicts with the current screenshot-aligned dashboard structure.

## Architecture

- Create and work on feature branch `feature/dashboard-phase-3`.
- Keep the dashboard route in `src/app/dashboard/page.tsx`.
- Keep `src/components/dashboard/dashboard-shell.tsx` as the composition point for the full dashboard layout.
- Continue using direct imports from `src/lib/mock-data.ts` instead of introducing fetching or persistence.
- Add only small presentational components where they improve readability, such as a stat card and a recent item row or card.

## Main Content Layout

- Preserve the existing dashboard title and subtitle near the top of the main panel.
- Add a top stats section with 4 cards in this order:
  - total items
  - total collections
  - favorite items
  - favorite collections
- Keep the collections section visible below the stats section and show all 6 mock collections.
- Keep the pinned items section below collections and show all pinned items from `mockItems`.
- Add a recent items section below pinned items and show exactly 10 items sorted by `updatedAt` descending.
- Keep the layout responsive:
  - stats cards collapse from 4 columns to fewer columns on smaller widths
  - collections remain a grid
  - pinned items and recent items remain vertically stacked lists or cards

## Data Derivation

- Derive summary counts directly inside the dashboard shell from mock data:
  - total items from `mockItems.length`
  - total collections from `mockCollections.length`
  - favorite items from `mockItems.filter((item) => item.isFavorite)`
  - favorite collections from `mockCollections.filter((collection) => collection.isFavorite)`
- Derive pinned items from `mockItems.filter((item) => item.isPinned)`.
- Derive recent items by sorting `mockItems` by `updatedAt` descending and slicing to 10.
- Keep the content display-only for this phase. Buttons and search remain unchanged unless already present.

## Component Boundaries

- Reuse `DashboardCollectionCard` for the collections section.
- Reuse `DashboardPinnedItem` only if its visual treatment fits the recent items section; otherwise add a small dedicated recent-item component.
- Add a small stat-card component rather than inline-repeating four similar blocks in the shell.
- Avoid unrelated refactors to sidebar components, routing, or mock data structure unless a tiny type change is required for phase 3 rendering.

## Verification

- Update `context/current-feature.md` so phase 3 becomes the active feature and its status is `In Progress` before implementation starts.
- Verify `/dashboard` in browser at desktop and mobile widths.
- Run `pnpm lint`.
- Run `pnpm exec tsc --noEmit`.
- Run `pnpm build`.
- Do not commit unless the user explicitly asks.
