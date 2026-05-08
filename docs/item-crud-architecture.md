# Item CRUD Architecture

## Scope

This document outlines a unified CRUD architecture for all seven DevStash item types:

- `snippet`
- `prompt`
- `note`
- `command`
- `file`
- `image`
- `link`

It is based on the current repository conventions and the existing data model. The goal is one shared item system with:

- one server action file for item mutations
- `lib/db` query helpers called directly from server components
- one dynamic route for item-type pages
- shared UI components that adapt by item type

## Current Baseline

### What already exists

- The `Item` Prisma model already supports all seven built-in types through one shared table
- Type metadata already lives in `ItemType` rows with `name`, `icon`, and `color`
- Server-rendered pages already fetch data by calling `src/lib/db/*` helpers directly
- Server actions are already centralized by domain in `src/actions/auth.ts`

### What does not exist yet

- There is no `src/app/items/[type]/page.tsx` route yet
- There is no `src/actions/items.ts` mutation file yet
- There are no item create/edit/delete forms yet
- The dashboard `New Item` button is currently visual only

## Guiding Principles

### 1. One item table, one mutation entrypoint

All item types should continue using the shared `Item` table from `prisma/schema.prisma`.

The mutation surface should live in one file:

- `src/actions/items.ts`

That keeps authorization, validation, normalization, cache invalidation, and redirect behavior in one place.

### 2. Reads belong in `lib/db`

Pages should continue the existing repo pattern:

- page/server component calls `get...` helpers from `src/lib/db/*`
- helpers query Prisma and return UI-ready data
- components receive shaped props, not raw Prisma records

This matches the current `dashboard` and `profile` implementations.

### 3. Type-specific behavior belongs in components and schemas, not actions

The action layer should stay generic.

It should not branch into separate business flows like `createSnippetAction`, `createPromptAction`, `createLinkAction`, and so on.

Instead:

- route params determine the active type
- a shared form chooses the right fields for that type
- validation schemas map type to allowed/required fields
- the action persists the normalized payload into the shared `Item` model

## Recommended File Structure

```text
src/
  actions/
    auth.ts
    items.ts

  app/
    items/
      [type]/
        page.tsx
        new/
          page.tsx
        [itemId]/
          page.tsx
          edit/
            page.tsx

  components/
    items/
      item-page-shell.tsx
      item-list.tsx
      item-list-card.tsx
      item-editor-shell.tsx
      item-form.tsx
      item-form-fields.tsx
      item-delete-button.tsx
      item-type-badge.tsx
      item-type-header.tsx

  lib/
    db/
      item-types.ts
      items.ts
    items/
      constants.ts
      schemas.ts
      mappers.ts
      types.ts
      utils.ts
```

## Responsibilities By Layer

### `src/actions/items.ts`

This file should own all item mutations:

- `createItemAction`
- `updateItemAction`
- `deleteItemAction`
- optionally `toggleItemFavoriteAction`
- optionally `toggleItemPinnedAction`

Responsibilities:

- verify the authenticated user
- parse `FormData`
- validate against shared item schemas
- resolve the item type from route-safe identifiers
- normalize optional fields before persistence
- enforce ownership on update/delete
- write through Prisma
- revalidate relevant item and dashboard paths
- redirect only when the UX needs a navigation change

What should not live here:

- type-specific JSX
- field rendering logic
- item-type page layout decisions
- presentation-only formatting

### `src/lib/db/items.ts`

This should own read helpers for item pages and detail views.

Recommended query helpers:

- `getItemsByType(userId, typeSlug)`
- `getItemEditorData(userId, typeSlug)`
- `getItemById(userId, itemId)`
- `getItemForEdit(userId, itemId)`
- `getItemTypeBySlug(typeSlug)`

Responsibilities:

- convert route slug to canonical item type
- query Prisma
- include related type, tags, and collection data as needed
- return shaped UI data instead of raw Prisma models
- keep item-type ordering and labels centralized

### `src/lib/items/schemas.ts`

This file should contain the data contract for all CRUD mutations.

Recommended responsibilities:

- shared base item schema
- per-type field requirements
- normalization helpers for text, file, and link-backed items
- route slug to canonical type mapping

This is the right place for type-aware validation rules such as:

- text types require `content`
- link types require `url`
- file/image types require uploaded file metadata
- `language` is only meaningful for code-oriented text types

### `src/components/items/*`

These components should carry the type-specific rendering logic.

Examples:

- `item-form.tsx` manages form framing, submit state, and shared inputs
- `item-form-fields.tsx` switches visible fields based on type classification
- `item-list-card.tsx` renders a generic card but shows URL/file/text affordances as needed
- `item-type-header.tsx` renders title, icon, color, and description for the active type page
- `item-delete-button.tsx` owns the destructive-action confirmation UI

## How `/items/[type]` Routing Should Work

### Route model

The sidebar already uses plural route segments:

- `/items/snippets`
- `/items/prompts`
- `/items/commands`
- `/items/notes`
- `/items/files`
- `/items/images`
- `/items/links`

That should become the canonical route layer.

### Resolution flow

1. The page receives `params.type`
2. A shared route-mapping helper resolves the slug to the canonical type name
3. The page loads the authenticated user
4. The page calls `lib/db` helpers with the canonical type
5. The page renders a shared item page shell with type-aware props

Recommended route mapping source:

- `src/lib/items/constants.ts`

Example mapping:

```ts
export const TYPE_ROUTE_SEGMENTS = {
  snippet: "snippets",
  prompt: "prompts",
  command: "commands",
  note: "notes",
  file: "files",
  image: "images",
  link: "links",
} as const;
```

This mapping already exists today inside `src/lib/db/sidebar.ts`. For CRUD architecture, it should move into a shared item-domain constant so routing, reads, and actions all use the same source.

### Page behavior

Recommended page split:

- `src/app/items/[type]/page.tsx`: list/filter view for one type
- `src/app/items/[type]/new/page.tsx`: create form for that type
- `src/app/items/[type]/[itemId]/page.tsx`: item detail view
- `src/app/items/[type]/[itemId]/edit/page.tsx`: edit form

All four pages should:

- authenticate first
- resolve `type` through shared constants
- call `lib/db` helpers directly
- pass prepared data into shared components

## Where Type-Specific Logic Should Live

### In components

Type-specific display logic belongs in components.

Examples:

- whether to show a multiline editor or a URL input
- whether to show file upload UI
- whether to show syntax/language controls
- whether preview content is rendered as text, file metadata, image preview, or external link

### In schemas

Type-specific validation belongs in schemas and mappers.

Examples:

- `snippet`, `prompt`, `note`, `command` => text-backed validation
- `link` => URL-backed validation
- `file`, `image` => file-backed validation

### Not in actions

The action layer should not become a switchboard of unrelated workflows.

Good:

- normalize validated payload
- persist generic `Item` fields

Bad:

- custom JSX branches
- route-specific rendering concerns
- duplicated create/update functions per item type

## Component Responsibilities

### `item-page-shell.tsx`

- page-level layout for all item type pages
- renders heading, actions, filters, and empty states
- receives already-fetched data

### `item-list.tsx`

- iterates over items for a type page
- renders empty state when no items exist

### `item-list-card.tsx`

- shared card for list/detail previews
- adapts secondary UI by classification:
  - text-backed: summary/body excerpt
  - URL-backed: external-link affordance
  - file-backed: filename, size, preview metadata

### `item-editor-shell.tsx`

- wraps create/edit forms
- renders type title, icon, color, and navigation context

### `item-form.tsx`

- top-level form component
- binds to one action from `src/actions/items.ts`
- manages form state and submit button UX

### `item-form-fields.tsx`

- maps type classification to the right inputs
- holds the rendering branches for:
  - shared fields: `title`, `description`, collection, tags
  - text fields: `content`, `language`
  - link fields: `url`
  - file fields: upload or file metadata inputs

### `item-delete-button.tsx`

- delete confirmation UX
- submits to `deleteItemAction`
- does not own data fetching

### `item-type-badge.tsx`

- shared compact rendering of icon, color, and type label
- reuse candidate for dashboard and item pages

## Data Model Implications For CRUD

The existing Prisma schema already supports the unified approach.

Shared item fields:

- `title`
- `description`
- `isFavorite`
- `isPinned`
- `collectionId`
- `typeId`
- `userId`

Text-backed fields:

- `content`
- `language`
- `contentType = "text"`

Link-backed fields:

- `url`
- `contentType = "link"`

File-backed fields:

- `fileUrl`
- `fileName`
- `fileSize`
- likely `contentType = "file"`

Because `contentType` is currently a plain string, the architecture should treat it as a normalized internal classification derived from the chosen item type.

## Recommended Mutation Flow

### Create

1. User opens `/items/[type]/new`
2. Server page resolves the type and loads supporting data
3. Shared form renders the correct fields
4. `createItemAction` validates and normalizes the payload
5. Action resolves the correct `typeId`
6. Action creates the item
7. Action revalidates `/dashboard` and the relevant `/items/[type]` page
8. Action redirects to the created item or back to the type list

### Update

1. User opens `/items/[type]/[itemId]/edit`
2. Server page loads the item and ensures it belongs to the current user
3. Shared form renders with existing values
4. `updateItemAction` validates and normalizes the payload
5. Action updates the shared `Item` record
6. Action revalidates dashboard, list, and detail routes

### Delete

1. User triggers delete from detail page or list row
2. `deleteItemAction` verifies ownership
3. Action deletes the item
4. Action revalidates dashboard and the parent type route
5. Action redirects to `/items/[type]` when needed

## Cache And Revalidation

The item actions should revalidate at least:

- `/dashboard`
- `/items/[type]`
- `/items/[type]/[itemId]` after update

If profile stats or other aggregate pages depend on item counts, revalidate:

- `/profile`

## Architectural Notes

### Route-safe type handling

Never trust raw route params or hidden form fields alone. Resolve them through shared constants and then look up the matching `ItemType` row.

### Ownership enforcement

All item reads and writes must be scoped by `session.user.id`.

That means:

- list queries filter by `userId`
- detail queries filter by `userId`
- update/delete actions verify the item belongs to the current user before mutating it

### Custom types later

This architecture still leaves room for Pro custom types because the schema already uses row-backed `ItemType` records rather than an enum.

## Assumptions And Gaps

- The prompt references `docs/content-types.md`, but that file does not exist in the repository
- This research used `docs/item-types.md` as the closest available source for type classification
- There is no current `/items` feature implementation, so this document is an architecture recommendation rather than a description of shipped CRUD code
- File upload mechanics are not defined yet, so file/image mutation details stop at the `Item` schema contract

## Recommended Starting Points

If implementation begins next, the first thin vertical slice should be:

1. add `src/lib/items/constants.ts` and move shared type-route mapping there
2. add `src/actions/items.ts` with `createItemAction`, `updateItemAction`, and `deleteItemAction`
3. add `src/lib/db/items.ts` query helpers for type list and item edit/detail data
4. add `/items/[type]` and `/items/[type]/new` for one text-backed type first, then generalize

## Sources

- `context/research/item-crud-research.md`
- `context/project-overview.md`
- `prisma/schema.prisma`
- `docs/item-types.md`
- `src/app/dashboard/page.tsx`
- `src/app/profile/page.tsx`
- `src/actions/auth.ts`
- `src/lib/db/items.ts`
- `src/lib/db/sidebar.ts`
- `src/lib/db/collections.ts`
- `src/lib/db/profile.ts`
- `src/components/dashboard/dashboard-shell.tsx`
- `src/components/dashboard/dashboard-sidebar.tsx`
