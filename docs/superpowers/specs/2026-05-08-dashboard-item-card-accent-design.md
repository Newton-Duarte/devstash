# Dashboard Item Card Accent Design

## Summary

Update the dashboard pinned item cards and recent item cards so their left accent treatment matches the existing collection cards exactly.

## Problem

The dashboard collection cards render their accent color as a true left-edge card treatment. The pinned and recent item cards currently simulate that look with an inset box shadow, which makes them visually inconsistent with the collection cards.

## Goals

- Make pinned item cards match the collection card left accent treatment.
- Make recent item cards match the collection card left accent treatment.
- Keep the current item content layout, spacing, badges, and icon blocks unchanged.
- Continue using the item type color as the accent source.

## Non-Goals

- No changes to collection cards.
- No new shared wrapper or refactor across card components.
- No changes to the dashboard data model or data loading.

## Chosen Approach

Use the same outer card shell pattern already used by `DashboardCollectionCard` in both `DashboardPinnedItem` and `DashboardRecentItem`.

This means:

- Replace the inset shadow-based accent styling on item cards.
- Apply the same card container structure and left-edge accent treatment used by collection cards.
- Preserve the existing internal markup for item-specific content.

## Why This Approach

- It produces the closest visual match to the approved collection card pattern.
- It keeps the change small and local to the affected components.
- It avoids an unnecessary abstraction for a simple UI consistency fix.

## Affected Files

- `src/components/dashboard/dashboard-pinned-item.tsx`
- `src/components/dashboard/dashboard-recent-item.tsx`

## Testing

- Verify the dashboard renders without layout regressions.
- Confirm pinned and recent item cards show the same left accent treatment as collection cards.
- Run `pnpm build` before considering the fix complete.
