# Current Feature

Dashboard UI Phase 2 - replace the placeholder dashboard sidebar with mock-data-backed navigation, collections, and responsive drawer behavior.

## Status

Completed

## Goals

- Add a collapsible sidebar on desktop.
- Add item type links that use plural routes like `/items/snippets`.
- Show favorite collections.
- Show most recent collections.
- Add a user avatar area at the bottom of the sidebar.
- Add a drawer icon to open and close the sidebar.
- Always use a drawer pattern on mobile view.

## Notes

- This is phase 2 of 3 for the dashboard UI.
- Use `@src/lib/mock-data.ts` directly for item types, collections, counts, and user info.
- Visual reference: `@context/screenshots/dashboard-ui-main.png`.
- Phase 1 spec: `@context/features/dashboard-phase-1-spec.md`.
- Follow-on spec: `@context/features/dashboard-phase-3-spec.md`.

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
