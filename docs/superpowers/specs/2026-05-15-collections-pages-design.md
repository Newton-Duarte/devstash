# Collections Pages Design

## Goal

Add protected collection browsing routes so users can see every collection and open a collection-specific item list.

## Routes

- `/collections` shows all collections for the signed-in user.
- `/collections/[id]` shows one signed-in user's collection and the items assigned to it.
- Unknown or unauthorized collection IDs return the existing Next.js not-found flow.

## UI

The collection index uses the same card style currently used on the dashboard. Collection cards link to their detail route. The page uses the existing dashboard app shell, a summary header, and an empty state when no collections exist.

The collection detail page uses the dashboard app shell, a header with collection metadata, and the existing item drawer. File items render in a file list section, image items render in an image gallery section, and all other item types render together in the standard card grid so each card keeps its type accent treatment.

## Data Flow

Server components authenticate with `auth()` and redirect unauthenticated users to `/sign-in`. Prisma helpers in `src/lib/db/collections.ts` fetch user-scoped collection index and detail data. Item card data should reuse the existing item-list shape where practical to avoid duplicate presentation mapping.

## Links

The sidebar `View all collections` link remains `/collections`. Sidebar collection rows and collection cards link to `/collections/[id]`.

## Testing

This feature is mostly authenticated Prisma-backed page fetching and presentation. Avoid low-value heavy mocks. Verify with lint, build, and browser checks for `/collections`, `/collections/[id]`, sidebar links, card links, empty states, and item drawer behavior.
