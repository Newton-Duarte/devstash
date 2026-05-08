# Items List Three Column Layout Design

## Summary

Update the `/items/[type]` listing page so item cards render in three columns on large screens while preserving the current responsive behavior on smaller breakpoints.

## Goals

- Keep mobile layouts unchanged.
- Keep medium screens at two columns.
- Switch the grid to three columns at the `lg` breakpoint.
- Preserve the existing `ItemCard` component and page structure.

## Approach

Use a minimal Tailwind grid class adjustment in `src/app/items/[type]/page.tsx`.

- Current layout: `grid gap-5 md:grid-cols-2`
- New layout: `grid gap-5 md:grid-cols-2 lg:grid-cols-3`

This keeps tablet behavior intact and only increases density for larger desktop widths.

## Scope

In scope:

- Items listing page grid breakpoint update.
- Responsive verification for the listing page.

Out of scope:

- `ItemCard` redesign.
- Container width changes.
- Changes to dashboard card grids or unrelated list views.

## Risks

- Some card content may wrap more aggressively at desktop widths when three cards share a row.

## Verification

- Confirm the items page remains one column on small screens.
- Confirm it stays two columns at `md` widths.
- Confirm it becomes three columns at `lg` widths and above.
- Run lint and targeted visual verification in the browser.
