# Item Drawer Design

## Goal

Add a right-side item detail drawer that opens from dashboard and item list cards without navigating away from the current page.

## Scope

- Use a shadcn-style Sheet component that opens from the right.
- Keep existing dashboard and item list page data loading in server components.
- Add a client wrapper that owns drawer state and fetches full item details on card click.
- Add an authenticated `/api/items/[id]` route that returns full details only for the signed-in owner.
- Render a skeleton while item details load and a compact retryable error state on failure.
- Render display-only action buttons for Favorite, Pin, Copy, Edit, and Delete in this first version.
- Leave mutations, edit flows, code editors, and item-type-specific detail panes for later features.

## Architecture

The dashboard and item list routes remain server components. They continue to fetch summary item data with Prisma, then pass that data to small client wrapper components. Each wrapper renders the existing card components with click handlers and includes one shared drawer instance.

The drawer implementation is reusable across dashboard and item list contexts. It accepts the selected item id, open state, close callback, and the resolved detail state. This keeps card rendering and drawer rendering separate while avoiding duplicate drawer logic.

The API route lives at `/api/items/[id]`. It reads the current session, rejects unauthenticated requests, validates the route id, and calls a query function in `src/lib/db/items.ts`. The query filters by both item id and user id so users cannot fetch another user's item by guessing an id.

## Data Flow

1. Server page fetches summary cards as it does today.
2. User clicks an item card.
3. Client wrapper stores the selected item id, opens the drawer immediately, and starts fetching `/api/items/[id]`.
4. Drawer shows a skeleton until the fetch resolves.
5. Successful responses render the full item details, including title, description, content, URL, language, type, tags, optional collection, pinned/favorite state, and timestamps where available.
6. Failed responses render an error message with a retry action.
7. Closing the drawer clears transient loading and error state.

## UI

The drawer should match the existing dark, rounded DevStash dashboard style and use the screenshot in `context/screenshots/dashboard-ui-drawer.png` as the visual reference. It should open from the right and feel like the item detail view, not a temporary popover.

Cards should remain keyboard-accessible when they become clickable. Use semantic button behavior or equivalent keyboard handling rather than relying on mouse-only `article` clicks.

The action bar appears near the top of the drawer. Favorite uses a star icon and is yellow when the item is favorited. Pin, Copy, and Edit sit with the primary action group. Delete uses a trash icon and is visually pushed to the right. All action buttons are display-only for this version.

The detail body focuses on general item data only. Type-specific editors and richer previews are intentionally out of scope.

## Error Handling

- Unauthenticated API requests return an unauthorized response.
- Missing or unauthorized items return a not-found response without leaking ownership details.
- Invalid responses or network failures show a user-friendly drawer error state.
- Retry refetches the currently selected item without closing the drawer.

## Testing And Verification

Use lightweight tests for pure mapping or formatting logic if new testable utilities are introduced. Avoid low-value tests that require heavy Prisma, Auth.js, or route-handler mocking. Verify the feature with `pnpm test`, `pnpm lint`, `pnpm build`, and browser checks on dashboard and item list pages.
