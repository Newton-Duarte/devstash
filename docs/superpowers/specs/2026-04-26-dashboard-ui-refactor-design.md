# Dashboard UI Refactor Design

## Summary

Refactor the current dashboard UI so the existing surfaces align much more closely with the provided screenshots. The work stays within the current dashboard shell and does not add the right-side item detail drawer yet. Instead, it reshapes the sidebar, top bar, collections area, and pinned items area using the existing mock data and current dashboard route.

## Chosen Approach

Use a screenshot-aligned refactor of the existing phase 2 layout.

Why this approach:
- It fixes the main visual and structural mismatches without jumping ahead into phase 3 behavior.
- It preserves the current responsive sidebar work and builds on the existing mock-data-backed dashboard.
- It keeps the scope focused on the surfaces visible in the screenshots that already belong on the current dashboard page.

Alternatives considered:
- Minimal polish only: rejected because it would still leave the main dashboard surface too far from the screenshots.
- Full pre-phase-3 dashboard implementation: rejected because the requested scope excludes the right-side item drawer and future detail interactions.

## Architecture

- Keep the current `/dashboard` route and the existing phase 2 responsive sidebar behavior.
- Refactor the main dashboard surface away from placeholder panels into screenshot-aligned sections: page heading and subtitle, collections grid, and pinned items list.
- Reuse `mockCollections`, `mockItems`, `mockItemTypes`, and `mockItemTypeCounts` directly.
- Add only a few focused dashboard UI components if needed for clarity, keeping the changes centered in the dashboard component layer.

## Visual Refactor

- Sidebar: move closer to the screenshot's flatter app-shell styling instead of a floating card, tighten the vertical rhythm and section spacing, and improve headings, counts, item rows, and the bottom user area to match the reference more closely.
- Top bar: match the screenshot structure with a dedicated left toggle area, search treatment in the center area, and right-side action buttons; add the missing `New Collection` button visually; keep actions display-only.
- Main content: replace the current placeholder callout blocks with real dashboard sections from the screenshot, add collection cards using mock collections, add a pinned items list using pinned mock items, and keep all content static and display-only for now.
- Overall styling: move closer to the darker, sharper visual language in the screenshots, reduce overly soft rounding where it conflicts with the reference, and use thinner borders, tighter spacing, quieter muted text, and small color accents tied to data categories.

## Verification

- Do not switch `context/current-feature.md` to a new phase for this pass.
- Implement the refactor on a new branch from `main`.
- Verify with `pnpm lint` and `pnpm build`.
- Verify in the browser at `/dashboard` against the provided screenshots for the surfaces in scope.
