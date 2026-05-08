# DevStash Item Types

## Overview

DevStash defines seven built-in system item types: `snippet`, `prompt`, `note`, `command`, `file`, `image`, and `link`.

The canonical source for the current type metadata is `prisma/seed.ts`, which seeds each system type with a `name`, `icon`, and `color`. The shared item model lives in `prisma/schema.prisma` and uses one `Item` table for all types, with optional fields enabled depending on the type.

## System Types

| Type | Icon | Hex Color | Purpose | Key Fields Used |
| --- | --- | --- | --- | --- |
| `snippet` | `Code` | `#3b82f6` | Save reusable code examples and implementation patterns. | `title`, `contentType`, `content`, `description`, `language`, `typeId`, `userId` |
| `prompt` | `Sparkles` | `#8b5cf6` | Save reusable AI prompts and workflow instructions. | `title`, `contentType`, `content`, `description`, `typeId`, `userId` |
| `note` | `StickyNote` | `#fde047` | Save plain written notes or lightweight documentation. | `title`, `contentType`, `content`, `description`, `typeId`, `userId` |
| `command` | `Terminal` | `#f97316` | Save shell commands and command-line workflows. | `title`, `contentType`, `content`, `description`, `typeId`, `userId` |
| `file` | `File` | `#6b7280` | Save uploaded files such as docs, templates, or assets. | `title`, `contentType`, `fileUrl`, `fileName`, `fileSize`, `description`, `typeId`, `userId` |
| `image` | `Image` | `#ec4899` | Save uploaded images and visual references. | `title`, `contentType`, `fileUrl`, `fileName`, `fileSize`, `description`, `typeId`, `userId` |
| `link` | `Link` | `#10b981` | Save external URLs and references. | `title`, `contentType`, `url`, `description`, `typeId`, `userId` |

## Type Details

### `snippet`

- Seed metadata: `Code`, `#3b82f6`
- Seeded examples show `snippet` items as text-backed content with code in `content`
- `language` is actively used for snippets in seed data, which makes it the most code-oriented text type

### `prompt`

- Seed metadata: `Sparkles`, `#8b5cf6`
- Used for AI instructions and reusable prompt templates
- Stored as text content in `content`

### `note`

- Seed metadata: `StickyNote`, `#fde047`
- Present as a built-in system type, but there are no current seeded `note` items
- Based on the shared schema, it fits the same text-backed shape as `prompt` and `snippet`, without any type-specific fields

### `command`

- Seed metadata: `Terminal`, `#f97316`
- Used for shell commands and operational workflows
- Stored as text content in `content`
- Current seed data does not assign `language`, so commands are text-based rather than code-highlight-specific in the current model

### `file`

- Seed metadata: `File`, `#6b7280`
- Intended for uploaded files
- Present as a built-in system type, but there are no current seeded `file` items
- The schema indicates file-backed storage via `fileUrl`, `fileName`, and `fileSize`

### `image`

- Seed metadata: `Image`, `#ec4899`
- Intended for uploaded images
- Present as a built-in system type, but there are no current seeded `image` items
- Uses the same file-backed field set as `file`

### `link`

- Seed metadata: `Link`, `#10b981`
- Used for external documentation, references, and third-party resources
- Seeded examples use `contentType: "link"` and populate `url`

## Classification Summary

### Text-backed types

- `snippet`
- `prompt`
- `note`
- `command`

These types are best represented by `content` plus optional descriptive metadata. In current seed data, they use `contentType: "text"`.

### File-backed types

- `file`
- `image`

These types are represented by uploaded asset fields in the schema: `fileUrl`, `fileName`, and `fileSize`. The original project overview also describes file uploads for images, docs, and templates.

### URL-backed types

- `link`

This type uses `url` for the external destination. In current seed data, it uses `contentType: "link"`.

## Shared Properties

All item types share the same base `Item` model fields:

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
- `collectionId`
- `createdAt`
- `updatedAt`

All types also resolve through an `ItemType` relation, which supplies:

- `name`
- `icon`
- `color`
- `isSystem`

## Display Differences In The Current App

The current UI does not yet render deeply different layouts per item type. Instead, item types mainly affect metadata, iconography, color, routing, and a few badges.

### Shared display behavior

- Dashboard cards render the type icon and color accent from `ItemType`
- Pinned and recent item cards show a type pill using the type name and color
- Sidebar and profile views sort and display built-in types in a fixed order

### Link-specific behavior

- Recent-item cards show an external-link glyph when `item.url` is present
- `link` items are the only seeded type that currently exercises this branch directly

### Pro gating in navigation

- The dashboard sidebar marks `file` and `image` as `PRO`
- Other built-in system types do not receive that badge

### Ordering and routes

- Sidebar route segments are `snippets`, `prompts`, `commands`, `notes`, `files`, `images`, and `links`
- Sidebar order is: `snippet`, `prompt`, `command`, `note`, `file`, `image`, `link`
- Profile breakdown order is: `snippet`, `prompt`, `note`, `command`, `link`, `file`, `image`

## Current Gaps And Implications

- Seed data currently includes examples for `snippet`, `prompt`, `command`, and `link`
- Seed data currently does not include examples for `note`, `file`, or `image`
- The live schema supports file-backed and image-backed items, but the current researched UI mostly treats items generically and derives presentation from `ItemType` metadata
- `contentType` is a free-form `String` in the current Prisma schema, even though the project overview describes a smaller conceptual set such as text and file

## Sources

- `context/project-overview.md`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/db/sidebar.ts`
- `src/lib/db/profile.ts`
- `src/lib/db/items.ts`
- `src/components/dashboard/dashboard-item-type-icon.tsx`
- `src/components/dashboard/dashboard-recent-item.tsx`
- `src/components/dashboard/dashboard-pinned-item.tsx`
- `src/components/dashboard/dashboard-sidebar.tsx`
