# Dashboard Phase 1 Design

## Summary

Implement the first dashboard UI slice as a small App Router addition. The work will create a `/dashboard` route, initialize ShadCN with only the minimum components needed for this screen, and ship a dark-mode-first dashboard shell with display-only placeholders for the sidebar and main content.

## Chosen Approach

Use minimal ShadCN setup plus a route-local dashboard shell.

Why this approach:
- It satisfies the phase 1 spec directly.
- It avoids introducing shared abstractions before phases 2 and 3 clarify the final dashboard structure.
- It keeps changes small in a repo that currently only has a minimal root app shell.

Alternatives considered:
- Shared app-wide shell now: rejected because it would add more global structure than phase 1 requires.
- Pure Tailwind placeholders without ShadCN setup: rejected because phase 1 explicitly requires ShadCN initialization and component installation.

## Architecture

- Create a feature branch named `feature/dashboard-phase-1`.
- Keep the dashboard screen in `src/app/dashboard/page.tsx`.
- Preserve `src/app/layout.tsx` as the root shell, updating it only as needed to support dark mode by default.
- Add the minimum ShadCN setup needed for this screen.
- Install only the components required now: `button` and `input`.

## UI and Styling

- Build a display-only dashboard shell with three visible regions: top bar, sidebar placeholder, and main placeholder.
- The top bar includes a search input on the left and a `New Item` button on the right.
- The sidebar and main regions use `h2` placeholders with the exact labels `Sidebar` and `Main`.
- Styling stays within the existing Tailwind v4 setup. Do not add `tailwind.config.*`.
- Add only enough global theme variables or base styles to make dark mode the default and keep the screen coherent.

## Verification

- Run `pnpm lint`.
- Run `pnpm build` as the main completion gate from the repo workflow.
- Run `pnpm exec tsc --noEmit` only if an extra focused TypeScript check is helpful.
- Do not commit unless the user explicitly asks.
