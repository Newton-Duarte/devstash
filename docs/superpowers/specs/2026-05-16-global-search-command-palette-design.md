# Global Search / Command Palette Design

## Overview

Add a global command palette available from the protected app shell. Users can open it with Cmd+K, Ctrl+K, or the top bar search input, then search across their items and collections without additional server round-trips while typing.

## Goals

- Open the palette from Cmd+K on Mac, Ctrl+K on Windows/Linux, and the top bar search input.
- Search all authenticated user items and collections with client-side fuzzy matching.
- Group results into Items and Collections sections.
- Preserve keyboard navigation through the command palette component.
- Show item type icons for items and item counts for collections.
- Open selected items in the existing item drawer on the current page.
- Navigate selected collections to `/collections/[id]`.

## Architecture

Use an app-shell-owned palette. Server pages will load reusable searchable data alongside existing sidebar/page data and pass it to `DashboardAppShell`. The shell will own palette open state, shortcut handling, the top bar search trigger, and the shared item drawer used by palette item results.

This avoids duplicating palette behavior across dashboard, item, collection, and profile pages. It also keeps search fully client-side after page load while preserving authenticated, user-scoped Prisma reads on the server.

## Components

- `DashboardAppShell` accepts searchable data and renders the global palette.
- `GlobalSearchPalette` renders the Command dialog, grouped results, empty state, and selection behavior.
- A ShadCN-style `Command` UI wrapper provides the `cmdk` primitives used by the palette.
- The existing `ItemDetailDrawer` and `useItemDrawer` flow are reused for item selection.

## Data Flow

Add a server-side data function that returns all searchable records for the current user:

- Items: id, title, type name, type icon, type color, and content preview.
- Collections: id, name, description preview, and item count.

Protected pages that use `DashboardAppShell` will fetch this data in parallel with existing page data. `GlobalSearchPalette` filters the provided arrays locally.

## Search Behavior

Use a small fuzzy search utility rather than a server API route. The utility should normalize case and support matching query characters in order across title/name, type, and preview fields. Exact substring matches should rank above looser fuzzy matches.

When the query is empty, the palette can show a small set of recent or top records from the preloaded arrays. When there are no matches, it should show a concise empty state.

## Selection Behavior

Selecting an item closes the palette and opens the existing drawer in place. The drawer fetches item details through the existing `/api/items/[id]` flow, preserving current loading, error, edit, delete, and update behavior.

Selecting a collection closes the palette and navigates to `/collections/[id]`.

## Error Handling

The searchable data load happens during page render. If that server-side load fails, the page follows existing Next.js error behavior. Item drawer fetch errors continue to use the existing drawer retry state.

## Testing

Add Vitest coverage for the fuzzy search utility because it is deterministic server/client-safe logic. Do not add low-value component tests for the dialog or Prisma fetch wiring because that would require heavier mocking than the current test strategy prefers.

Run `pnpm test`, `pnpm lint`, and `pnpm build` after implementation.

## Out Of Scope

- Dedicated item detail pages.
- Search API routes or server round-trips while typing.
- Cross-user or public search.
- Full-text database search.
- Command actions beyond opening items and collections.
