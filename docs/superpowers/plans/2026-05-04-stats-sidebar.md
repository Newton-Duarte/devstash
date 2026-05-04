# Plan: Stats And Sidebar

> Source PRD: `context/features/stats-sidebar-spec.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: item type links use current UI-aligned plural slugs such as `/items/snippets`; collection links stay `/collections/[id]`; the sidebar footer link goes to `/collections`.
- **Data owner**: use the seeded demo user until authentication is wired.
- **Data access**: fetch directly in the server-rendered dashboard route using Prisma-backed helper modules.
- **UI structure**: preserve the current dashboard shell, sidebar layout, and mobile drawer behavior.
- **Collection indicator rule**: non-favorite collection rows use the most-used item type color, with deterministic tie-breaking and a neutral fallback.

---

## Phase 1: Feature Workflow Setup

**User stories**: track the active feature in `context/current-feature.md` and start work on a dedicated branch.

### What to build

Switch the active feature context to the stats/sidebar work, mark it in progress, and create the feature branch before implementation changes begin.

### Acceptance criteria

- [ ] `context/current-feature.md` describes the stats/sidebar feature as the active work item.
- [ ] The feature status is marked in progress before code implementation begins.
- [ ] A dedicated feature branch exists for this work.

---

## Phase 2: Sidebar Data Pipeline

**User stories**: show system item types in the sidebar from the database; show favorite and recent collections from the database; use pluralized item-type links; expose the `/collections` "View all collections" target.

### What to build

Add a server-side sidebar data source that returns render-ready type and collection data for the dashboard, and wire that data into the existing server-rendered dashboard route alongside the already DB-backed main-area data.

### Acceptance criteria

- [ ] The dashboard route fetches sidebar data on the server in parallel with existing dashboard data.
- [ ] Sidebar item types come from database records and include DB-backed counts.
- [ ] Sidebar item-type links use pluralized UI slugs.
- [ ] Sidebar collection data is split into favorite and recent lists and includes the `/collections` link target.

---

## Phase 3: Sidebar UI Migration

**User stories**: replace sidebar mock types and collections with DB-backed data; preserve stars for favorites; show colored circles for non-favorites; keep collapsed and mobile sidebar behavior.

### What to build

Update the dashboard sidebar presentation to consume the new server-provided sidebar payload while preserving the current layout, section hierarchy, and responsive behavior.

### Acceptance criteria

- [ ] Sidebar type rows render DB-backed labels, icons, counts, and links.
- [ ] Favorite collection rows still display a star indicator.
- [ ] Non-favorite collection rows display a colored circle derived from the dominant item type.
- [ ] Desktop collapsed mode and mobile drawer mode still render correctly with the new props.
- [ ] The "View all collections" link appears under the collections list.

---

## Phase 4: Verification And Completion

**User stories**: keep the dashboard stats aligned with database counts; verify the dashboard still works; complete the feature workflow after successful verification.

### What to build

Run the required verification, confirm the dashboard still uses database-backed stats and renders the migrated sidebar correctly, and only then mark the feature completed in the current-feature tracker.

### Acceptance criteria

- [ ] `pnpm build` passes.
- [ ] The dashboard stats still reflect database-backed counts.
- [ ] The sidebar renders database-backed types and collections correctly.
- [ ] The active feature tracker is updated to completed only after verification succeeds.
