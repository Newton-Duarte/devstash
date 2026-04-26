# Dashboard Phase 2 Design

## Summary

Implement the second dashboard UI slice by replacing the sidebar placeholder with real navigation content and adding responsive sidebar behavior. The work keeps the existing `/dashboard` route and phase 1 shell, uses the mock data directly, and adds only the client-side interactivity needed for desktop collapse and mobile drawer behavior.

## Chosen Approach

Use the existing phase 1 dashboard shell as the base and replace the sidebar placeholder with a real sidebar plus a mobile drawer.

Why this approach:
- It satisfies the phase 2 spec with the smallest correct change set.
- It preserves the route and layout work already completed in phase 1.
- It keeps phase 3 free to focus on the main dashboard content instead of reworking navigation structure.

Alternatives considered:
- Split the dashboard into more shared layout primitives now: rejected because phase 2 does not require that extra structure.
- Implement desktop collapse only and defer the mobile drawer: rejected because the phase 2 spec explicitly requires drawer behavior on mobile.

## Architecture

- Keep the dashboard route at `src/app/dashboard/page.tsx`.
- Refactor `src/components/dashboard/dashboard-shell.tsx` so the sidebar becomes real dashboard navigation fed by `src/lib/mock-data.ts`.
- Add a small client-only boundary only where state is required for desktop sidebar collapse/expand and mobile drawer open/close.
- Keep the top bar and main area in the same shell.
- Generate plural item-type links like `/items/snippets`, `/items/prompts`, and `/items/commands`.

## Sidebar Content and Behavior

- Replace the `Sidebar` placeholder with item type links, favorite collections, most recent collections, and a user avatar or profile area near the bottom.
- Use the mock data directly: `mockItemTypes` for item type links, `mockItemTypeCounts` for counts, `mockCollections` filtered and sorted for favorites and recents, and `mockUser` for the profile area.
- Desktop behavior: sidebar is visible by default, and the drawer icon toggles collapsed versus expanded state.
- Mobile behavior: sidebar is always rendered as a drawer or sheet, and the drawer icon opens and closes that panel.
- The main panel can remain mostly placeholder content in phase 2, but it should visually fit beside the real sidebar.

## Verification

- Update `context/current-feature.md` so phase 2 becomes the active feature and its status is `In Progress` before implementation starts.
- Create a new feature branch for phase 2.
- Verify with `pnpm lint` and `pnpm build`.
- Verify in the browser at `/dashboard` on desktop and mobile widths.
- After verification succeeds, update `context/current-feature.md` to mark phase 2 `Completed` and add a history entry.
