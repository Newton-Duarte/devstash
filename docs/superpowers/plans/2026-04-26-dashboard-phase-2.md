# Dashboard UI Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the phase 1 dashboard placeholder into a responsive sidebar-driven dashboard with collapsible desktop navigation, a mobile drawer, mock-data-backed sections, and an updated current feature tracker.

**Architecture:** Keep the `/dashboard` App Router entrypoint unchanged and concentrate phase 2 work in the dashboard component layer. Introduce a small client-side sidebar controller for collapse and drawer state, feed sidebar sections directly from `src/lib/mock-data.ts`, and preserve the existing top bar while upgrading the main layout to fit a real sidebar.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives, lucide-react, ESLint

---

## File Structure

- Modify: `context/current-feature.md`
  Purpose: switch the active feature from phase 1 to phase 2 before implementation, then mark phase 2 completed after verification.
- Modify: `src/components/dashboard/dashboard-shell.tsx`
  Purpose: replace the placeholder shell with the real phase 2 dashboard layout and wire in the new sidebar components.
- Create: `src/components/dashboard/dashboard-sidebar.tsx`
  Purpose: render item type links, favorite collections, recent collections, and the user area from mock data.
- Create: `src/components/dashboard/dashboard-sidebar-drawer.tsx`
  Purpose: handle the mobile drawer container and overlay behavior.
- Create: `src/components/dashboard/dashboard-sidebar-toggle.tsx`
  Purpose: encapsulate the drawer/collapse trigger button used in the top bar.
- Modify: `src/lib/mock-data.ts`
  Purpose: export explicit TypeScript types if needed so the new dashboard components can consume mock data cleanly without `any`.

### Task 1: Update the current feature doc for phase 2 and create the branch

**Files:**
- Modify: `context/current-feature.md`

- [ ] **Step 1: Update `context/current-feature.md` so phase 2 is the active feature**

Change `context/current-feature.md` so it reads:

```md
# Current Feature

Dashboard UI Phase 2 - replace the placeholder dashboard sidebar with mock-data-backed navigation, collections, and responsive drawer behavior.

## Status

In Progress

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
```

- [ ] **Step 2: Create and switch to the phase 2 feature branch**

Run: `git switch -c feature/dashboard-phase-2`
Expected: shell prints `Switched to a new branch 'feature/dashboard-phase-2'`

- [ ] **Step 3: Verify only the expected phase 2 doc changes are pending**

Run: `git status --short`
Expected: output shows `context/current-feature.md` and the uncommitted phase 2 spec/plan files as pending changes on the new branch.

### Task 2: Add typed helpers for the dashboard sidebar data

**Files:**
- Modify: `src/lib/mock-data.ts`

- [ ] **Step 1: Add exported types for the mock dashboard data**

Update the top of `src/lib/mock-data.ts` to include:

```ts
export interface MockUser {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface MockCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 2: Annotate the exported mock values used by phase 2**

Update the existing export declarations in `src/lib/mock-data.ts` exactly like this:

```ts
export const mockUser: MockUser = {
  id: 'user_1',
  email: 'demo@devstash.io',
  name: 'John Doe',
  isPro: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

export const mockItemTypes: MockItemType[] = [
```

and later in the same file:

```ts
export const mockCollections: MockCollection[] = [
```

Do not change any of the array objects themselves in this task.

- [ ] **Step 3: Verify the mock data file still type-checks**

Run: `pnpm exec tsc --noEmit --pretty false`
Expected: TypeScript exits successfully.

### Task 3: Build the sidebar components

**Files:**
- Create: `src/components/dashboard/dashboard-sidebar.tsx`
- Create: `src/components/dashboard/dashboard-sidebar-toggle.tsx`
- Create: `src/components/dashboard/dashboard-sidebar-drawer.tsx`

- [ ] **Step 1: Create the shared sidebar toggle button**

Create `src/components/dashboard/dashboard-sidebar-toggle.tsx` with:

```tsx
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DashboardSidebarToggleProps {
  collapsed: boolean;
  onClick: () => void;
}

export function DashboardSidebarToggle({
  collapsed,
  onClick,
}: DashboardSidebarToggleProps) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <Button
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden lg:inline-flex"
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      <Icon className="size-4" />
    </Button>
  );
}
```

- [ ] **Step 2: Create the mobile drawer container**

Create `src/components/dashboard/dashboard-sidebar-drawer.tsx` with:

```tsx
import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DashboardSidebarDrawer({
  open,
  onClose,
  children,
}: DashboardSidebarDrawerProps) {
  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] flex-col border-r border-border bg-background px-4 py-5 shadow-2xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            DevStash
          </p>

          <Button aria-label="Close sidebar" onClick={onClose} size="icon" type="button" variant="outline">
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Create the mock-data-backed sidebar**

Create `src/components/dashboard/dashboard-sidebar.tsx` with:

```tsx
import Link from "next/link";
import {
  Code2,
  File,
  FolderKanban,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Terminal,
} from "lucide-react";

import {
  type MockCollection,
  mockCollections,
  mockItemTypeCounts,
  mockItemTypes,
  mockUser,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap = {
  Code: Code2,
  Sparkles: MessageSquareQuote,
  Terminal,
  StickyNote: NotebookPen,
  File,
  Image: ImageIcon,
  Link: Link2,
} as const;

const favorites = mockCollections.filter((collection) => collection.isFavorite);
const recentCollections = [...mockCollections]
  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  .slice(0, 4);

function pluralizeType(type: string) {
  return type.endsWith("s") ? type : `${type}s`;
}

function SidebarCollectionLink({
  collection,
  condensed,
}: {
  collection: MockCollection;
  condensed: boolean;
}) {
  return (
    <Link
      className="group flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
      href={`/collections/${collection.id}`}
    >
      <span className={cn("truncate", condensed && "sr-only")}>{collection.name}</span>
      <span className="text-xs text-muted-foreground/80">{collection.itemCount}</span>
    </Link>
  );
}

interface DashboardSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
}

export function DashboardSidebar({
  collapsed = false,
  mobile = false,
}: DashboardSidebarProps) {
  const condensed = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-1">
        <p className={cn("px-3 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase", condensed && "sr-only")}>Types</p>
        <nav className="space-y-1">
          {mockItemTypes.map((itemType) => {
            const Icon = iconMap[itemType.icon as keyof typeof iconMap] ?? FolderKanban;
            const href = `/items/${pluralizeType(itemType.name)}`;
            const count = mockItemTypeCounts[itemType.name as keyof typeof mockItemTypeCounts] ?? 0;

            return (
              <Link
                className="group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-foreground transition hover:bg-accent"
                href={href}
                key={itemType.id}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border"
                  style={{ backgroundColor: `${itemType.color}20`, color: itemType.color }}
                >
                  <Icon className="size-4" />
                </span>

                <span className={cn("min-w-0 flex-1 truncate capitalize", condensed && "sr-only")}>{pluralizeType(itemType.name)}</span>
                <span className={cn("text-xs text-muted-foreground", condensed && "sr-only")}>{count}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-1">
        <p className={cn("px-3 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase", condensed && "sr-only")}>Favorites</p>
        <div className="space-y-1">
          {favorites.map((collection) => (
            <SidebarCollectionLink collection={collection} condensed={condensed} key={collection.id} />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className={cn("px-3 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase", condensed && "sr-only")}>Recent</p>
        <div className="space-y-1">
          {recentCollections.map((collection) => (
            <SidebarCollectionLink collection={collection} condensed={condensed} key={collection.id} />
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-3xl border border-border bg-card/70 p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
            {mockUser.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className={cn("min-w-0", condensed && "sr-only")}>
            <p className="truncate text-sm font-semibold text-foreground">{mockUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">{mockUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run lint on the new sidebar components**

Run: `pnpm lint src/components/dashboard/dashboard-sidebar.tsx src/components/dashboard/dashboard-sidebar-toggle.tsx src/components/dashboard/dashboard-sidebar-drawer.tsx`
Expected: ESLint exits successfully.

### Task 4: Upgrade the dashboard shell to use the responsive sidebar

**Files:**
- Modify: `src/components/dashboard/dashboard-shell.tsx`

- [ ] **Step 1: Convert the dashboard shell into a small client component and wire the sidebar state**

Replace `src/components/dashboard/dashboard-shell.tsx` with:

```tsx
"use client";

import { Menu, Plus, Search } from "lucide-react";
import { useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardSidebarDrawer } from "@/components/dashboard/dashboard-sidebar-drawer";
import { DashboardSidebarToggle } from "@/components/dashboard/dashboard-sidebar-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DashboardShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebarDrawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <DashboardSidebar mobile />
      </DashboardSidebarDrawer>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside
          className={cn(
            "hidden rounded-[2rem] border border-border bg-card/75 p-4 shadow-sm backdrop-blur lg:flex lg:flex-col",
            sidebarCollapsed ? "lg:w-[92px]" : "lg:w-[320px]"
          )}
        >
          <div className="mb-5 flex items-center justify-between gap-3 px-2">
            <div className={cn("min-w-0", sidebarCollapsed && "sr-only")}>
              <p className="text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">DevStash</p>
              <h1 className="text-sm font-semibold text-foreground">Workspace</h1>
            </div>

            <DashboardSidebarToggle
              collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed((current) => !current)}
            />
          </div>

          <DashboardSidebar collapsed={sidebarCollapsed} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                aria-label="Open sidebar"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Menu className="size-4" />
              </Button>

              <div className="relative w-full max-w-xl flex-1 sm:min-w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search items"
                  className="pl-10"
                  placeholder="Search snippets, prompts, notes, and commands"
                />
              </div>
            </div>

            <Button className="w-full sm:w-auto">
              <Plus className="size-4" />
              New Item
            </Button>
          </header>

          <main className="flex-1 rounded-[2rem] border border-border bg-card/65 p-6 shadow-sm">
            <div className="flex h-full min-h-[520px] flex-col justify-between gap-8 rounded-[1.5rem] border border-dashed border-border/80 bg-background/35 p-6">
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  Main Panel
                </p>
                <h2 className="text-2xl font-semibold text-foreground">Main</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-border bg-card/80 p-4">
                  <p className="text-sm font-medium text-foreground">Favorites and recents now live in the sidebar.</p>
                </div>
                <div className="rounded-3xl border border-border bg-card/80 p-4">
                  <p className="text-sm font-medium text-foreground">Phase 3 can replace this area with real dashboard content.</p>
                </div>
                <div className="rounded-3xl border border-border bg-card/80 p-4 md:col-span-2 xl:col-span-1">
                  <p className="text-sm font-medium text-foreground">Desktop supports collapse; mobile uses a drawer.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript after the shell refactor**

Run: `pnpm exec tsc --noEmit`
Expected: TypeScript exits successfully.

### Task 5: Finish verification and mark phase 2 complete

**Files:**
- Modify: `context/current-feature.md`

- [ ] **Step 1: Run the full lint pass**

Run: `pnpm lint`
Expected: ESLint exits successfully.

- [ ] **Step 2: Run the full production build**

Run: `pnpm build`
Expected: Next.js completes the build successfully and includes `/dashboard` in the route output.

- [ ] **Step 3: Verify `/dashboard` in the browser on desktop and mobile widths**

Run the app and confirm:
- desktop width shows the visible sidebar and collapse toggle
- mobile width shows a drawer trigger and slide-in sidebar
- sidebar contains plural item links, favorite collections, recent collections, and the user area

- [ ] **Step 4: Mark phase 2 completed in `context/current-feature.md`**

Update the relevant sections to:

```md
## Status

Completed

## History

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
```

- [ ] **Step 5: Confirm the final worktree state**

Run: `git status --short`
Expected: output shows only the intended phase 2 source, context, and docs changes.

## Self-Review

- Spec coverage check:
- Collapsible sidebar: covered in Tasks 3 and 4.
- Plural item-type links: covered in Task 3.
- Favorite collections: covered in Task 3.
- Most recent collections: covered in Task 3.
- User avatar area: covered in Task 3.
- Drawer icon open/close behavior: covered in Tasks 3 and 4.
- Mobile drawer requirement: covered in Tasks 3 and 4.
- Placeholder scan complete: no `TODO` or `TBD` markers remain.
- Type consistency check complete: sidebar props, mock data types, and route strings are consistent across tasks.
