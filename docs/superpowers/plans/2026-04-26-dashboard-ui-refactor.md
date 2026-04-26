# Dashboard UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the current dashboard UI so the existing dashboard surfaces align much more closely with the provided screenshots while staying within the current phase 2 scope.

**Architecture:** Keep the current `/dashboard` route and responsive sidebar behavior, but replace the placeholder-heavy main panel with screenshot-aligned dashboard sections. Reuse the existing mock data directly and keep the changes concentrated in the dashboard component layer, adding only a few focused presentational components where they improve readability.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives, lucide-react, ESLint

---

## File Structure

- Modify: `src/components/dashboard/dashboard-shell.tsx`
  Purpose: reshape the top bar and main dashboard surface to match the screenshots.
- Modify: `src/components/dashboard/dashboard-sidebar.tsx`
  Purpose: tighten the sidebar styling and hierarchy so it reads like the screenshot instead of a floating card.
- Create: `src/components/dashboard/dashboard-collection-card.tsx`
  Purpose: render the screenshot-style collection cards from `mockCollections`.
- Create: `src/components/dashboard/dashboard-pinned-item.tsx`
  Purpose: render the screenshot-style pinned item rows from `mockItems`.
- Modify: `src/lib/mock-data.ts`
  Purpose: export a typed shape for mock items if needed for the new pinned item component.

### Task 1: Create the refactor branch and add typed item data

**Files:**
- Modify: `src/lib/mock-data.ts`

- [ ] **Step 1: Create and switch to the refactor branch**

Run: `git switch -c feature/dashboard-ui-refactor`
Expected: shell prints `Switched to a new branch 'feature/dashboard-ui-refactor'`

- [ ] **Step 2: Add a typed interface for the pinned items data**

Update `src/lib/mock-data.ts` near the existing exported interfaces so it includes:

```ts
export interface MockItem {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  url?: string;
  description: string;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  itemTypeId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 3: Annotate the `mockItems` export**

Update the export declaration in `src/lib/mock-data.ts` to:

```ts
export const mockItems: MockItem[] = [
```

Do not change any existing mock item objects in this step.

- [ ] **Step 4: Verify TypeScript after the mock item typing change**

Run: `pnpm exec tsc --noEmit --pretty false`
Expected: TypeScript exits successfully.

### Task 2: Build the main dashboard content components

**Files:**
- Create: `src/components/dashboard/dashboard-collection-card.tsx`
- Create: `src/components/dashboard/dashboard-pinned-item.tsx`

- [ ] **Step 1: Create the screenshot-style collection card component**

Create `src/components/dashboard/dashboard-collection-card.tsx` with:

```tsx
import { Ellipsis, Folder, Link2, Sparkles, Star } from "lucide-react";

import { type MockCollection } from "@/lib/mock-data";

const collectionAccents = [
  "before:bg-[#2f81f7]",
  "before:bg-[#2f81f7]",
  "before:bg-[#2f81f7]",
  "before:bg-[#facc15]",
  "before:bg-[#f97316]",
  "before:bg-[#8b5cf6]",
];

const collectionIcons = [
  ["code", "note", "link"],
  ["code", "note"],
  ["file", "note"],
  ["note", "code", "link", "prompt"],
  ["command", "note"],
  ["prompt", "code", "note"],
] as const;

function MiniIcon({ kind }: { kind: (typeof collectionIcons)[number][number] }) {
  if (kind === "link") {
    return <Link2 className="size-4 text-[#10b981]" />;
  }

  if (kind === "prompt") {
    return <Sparkles className="size-4 text-[#8b5cf6]" />;
  }

  return (
    <span
      className={
        kind === "command"
          ? "text-sm text-[#f97316]"
          : kind === "file"
            ? "text-sm text-slate-400"
            : kind === "note"
              ? "text-sm text-[#facc15]"
              : "text-sm text-[#2f81f7]"
      }
    >
      {kind === "command" ? ">_" : kind === "file" ? "[]" : kind === "note" ? "[]" : "<>"}
    </span>
  );
}

interface DashboardCollectionCardProps {
  collection: MockCollection;
  index: number;
}

export function DashboardCollectionCard({
  collection,
  index,
}: DashboardCollectionCardProps) {
  const accentClass = collectionAccents[index] ?? collectionAccents[0];
  const icons = collectionIcons[index] ?? collectionIcons[0];

  return (
    <article
      className={`relative overflow-hidden rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${accentClass}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[1.05rem] font-semibold text-white">{collection.name}</h3>
            {collection.isFavorite ? (
              <Star className="size-4 fill-[#facc15] text-[#facc15]" />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{collection.itemCount} items</p>
        </div>

        <button
          aria-label={`More options for ${collection.name}`}
          className="text-muted-foreground transition hover:text-white"
          type="button"
        >
          <Ellipsis className="size-5" />
        </button>
      </div>

      <p className="mb-5 max-w-[28ch] text-sm leading-6 text-muted-foreground">
        {collection.description}
      </p>

      <div className="flex items-center gap-3">
        {icons.map((kind, iconIndex) => (
          <MiniIcon key={`${collection.id}-${iconIndex}`} kind={kind} />
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create the screenshot-style pinned item row component**

Create `src/components/dashboard/dashboard-pinned-item.tsx` with:

```tsx
import { Pin, Star } from "lucide-react";

import { type MockItem } from "@/lib/mock-data";

interface DashboardPinnedItemProps {
  item: MockItem;
}

export function DashboardPinnedItem({ item }: DashboardPinnedItemProps) {
  return (
    <article className="rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0f172a] text-[#2f81f7]">
              <span className="text-base font-semibold">&lt;/&gt;</span>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h3 className="text-[1.05rem] font-semibold text-white">{item.title}</h3>
                {item.isPinned ? <Pin className="size-4 text-muted-foreground" /> : null}
                {item.isFavorite ? <Star className="size-4 fill-[#facc15] text-[#facc15]" /> : null}
              </div>

              <p className="mb-4 text-sm text-muted-foreground">{item.description}</p>

              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    className="rounded-xl border border-border bg-[#16161b] px-3 py-1 text-xs font-medium text-slate-300"
                    key={`${item.id}-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">
          {item.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Verify the new dashboard content components lint cleanly**

Run: `pnpm lint src/components/dashboard/dashboard-collection-card.tsx src/components/dashboard/dashboard-pinned-item.tsx`
Expected: ESLint exits successfully.

### Task 3: Refactor the sidebar to match the screenshots more closely

**Files:**
- Modify: `src/components/dashboard/dashboard-sidebar.tsx`

- [ ] **Step 1: Tighten the sidebar styling and section hierarchy**

Replace `src/components/dashboard/dashboard-sidebar.tsx` with:

```tsx
import Link from "next/link";
import {
  ChevronDown,
  Code2,
  File,
  Folder,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Settings,
  Star,
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
  .slice(0, 3);

function pluralizeType(type: string) {
  return type.endsWith("s") ? type : `${type}s`;
}

function SidebarLabel({
  children,
  condensed,
}: {
  children: React.ReactNode;
  condensed: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 px-4 text-[0.95rem] font-medium text-slate-300", condensed && "justify-center px-0")}>
      <span className={cn(condensed && "sr-only")}>{children}</span>
      <ChevronDown className={cn("size-4 text-muted-foreground", condensed && "hidden")} />
    </div>
  );
}

function SidebarCollectionLink({
  collection,
  condensed,
  favorite = false,
}: {
  collection: MockCollection;
  condensed: boolean;
  favorite?: boolean;
}) {
  return (
    <Link
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.04]",
        condensed && "justify-center px-0"
      )}
      href={`/collections/${collection.id}`}
      prefetch={false}
    >
      <Folder className="size-4 shrink-0 text-slate-400" />
      <span className={cn("min-w-0 flex-1 truncate", condensed && "sr-only")}>{collection.name}</span>
      {favorite ? <Star className={cn("size-4 fill-[#facc15] text-[#facc15]", condensed && "hidden")} /> : null}
      {!favorite ? <span className={cn("text-sm text-muted-foreground", condensed && "hidden")}>{collection.itemCount}</span> : null}
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
    <div className="flex h-full flex-col gap-8 text-sm">
      <div className="space-y-4">
        <SidebarLabel condensed={condensed}>Types</SidebarLabel>

        <nav className="space-y-1">
          {mockItemTypes.map((itemType) => {
            const Icon = iconMap[itemType.icon as keyof typeof iconMap] ?? File;
            const href = `/items/${pluralizeType(itemType.name)}`;
            const count = mockItemTypeCounts[itemType.name as keyof typeof mockItemTypeCounts] ?? 0;

            return (
              <Link
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[0.95rem] text-slate-100 transition hover:bg-white/[0.04]",
                  condensed && "justify-center px-0"
                )}
                href={href}
                key={itemType.id}
                prefetch={false}
              >
                <Icon className="size-4 shrink-0" style={{ color: itemType.color }} />
                <span className={cn("min-w-0 flex-1 truncate capitalize", condensed && "sr-only")}>{pluralizeType(itemType.name)}</span>
                <span className={cn("text-base text-muted-foreground", condensed && "hidden")}>{count}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <SidebarLabel condensed={condensed}>Collections</SidebarLabel>

        <div className="space-y-5">
          <div>
            <p className={cn("px-4 text-xs tracking-[0.18em] text-muted-foreground uppercase", condensed && "sr-only")}>Favorites</p>
            <div className="mt-3 space-y-1">
              {favorites.map((collection) => (
                <SidebarCollectionLink
                  collection={collection}
                  condensed={condensed}
                  favorite
                  key={collection.id}
                />
              ))}
            </div>
          </div>

          <div>
            <p className={cn("px-4 text-xs tracking-[0.18em] text-muted-foreground uppercase", condensed && "sr-only")}>All collections</p>
            <div className="mt-3 space-y-1">
              {recentCollections.map((collection) => (
                <SidebarCollectionLink
                  collection={collection}
                  condensed={condensed}
                  key={collection.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <div className={cn("flex items-center gap-3 px-4 py-3", condensed && "justify-center px-0")}>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-sm font-semibold text-slate-900">
            {mockUser.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className={cn("min-w-0 flex-1", condensed && "sr-only")}>
            <p className="truncate text-[1rem] font-medium text-white">{mockUser.name}</p>
            <p className="truncate text-sm text-muted-foreground">john@example.com</p>
          </div>

          <button
            aria-label="Settings"
            className={cn("text-muted-foreground transition hover:text-white", condensed && "hidden")}
            type="button"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint the refactored sidebar**

Run: `pnpm lint src/components/dashboard/dashboard-sidebar.tsx`
Expected: ESLint exits successfully.

### Task 4: Refactor the dashboard shell to match the screenshots

**Files:**
- Modify: `src/components/dashboard/dashboard-shell.tsx`

- [ ] **Step 1: Replace the placeholder main surface with screenshot-aligned dashboard sections**

Replace `src/components/dashboard/dashboard-shell.tsx` with:

```tsx
"use client";

import { Menu, PanelLeft, Plus, Search, SquarePlus } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardCollectionCard } from "@/components/dashboard/dashboard-collection-card";
import { DashboardPinnedItem } from "@/components/dashboard/dashboard-pinned-item";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardSidebarDrawer } from "@/components/dashboard/dashboard-sidebar-drawer";
import { DashboardSidebarToggle } from "@/components/dashboard/dashboard-sidebar-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockCollections, mockItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function DashboardShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pinnedItems = useMemo(
    () => mockItems.filter((item) => item.isPinned).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
    []
  );

  return (
    <div className="min-h-screen bg-[#050507] text-foreground">
      <DashboardSidebarDrawer open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
        <DashboardSidebar mobile />
      </DashboardSidebarDrawer>

      <div className="flex min-h-screen border-l border-r border-border/80">
        <aside
          className={cn(
            "hidden border-r border-border/80 bg-[#030304] lg:flex lg:flex-col",
            sidebarCollapsed ? "lg:w-[82px]" : "lg:w-[366px]"
          )}
        >
          <div className="flex h-[84px] items-center justify-between border-b border-border/80 px-4">
            <div className={cn("flex items-center gap-4", sidebarCollapsed && "justify-center")}> 
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <span className="text-sm font-semibold">▤</span>
              </div>
              <span className={cn("text-[1.05rem] font-semibold text-white", sidebarCollapsed && "sr-only")}>DevStash</span>
            </div>

            <DashboardSidebarToggle
              collapsed={sidebarCollapsed}
              onClick={() => setSidebarCollapsed((current) => !current)}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
            <DashboardSidebar collapsed={sidebarCollapsed} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[84px] items-center border-b border-border/80 bg-[#07080a]">
            <div className="flex h-full w-[84px] items-center justify-center border-r border-border/80">
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

              <div className="hidden lg:flex">
                <Button
                  aria-label="Collapse sidebar"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <PanelLeft className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-4 px-5">
              <div className="relative w-full max-w-[520px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search items"
                  className="h-12 rounded-2xl border-border/80 bg-[#111216] pl-11 pr-16 text-[1.05rem] text-slate-200 placeholder:text-slate-500"
                  placeholder="Search items..."
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-border/80 bg-[#1a1b20] px-2 py-1 text-xs font-medium text-slate-400">
                  ⌘ K
                </span>
              </div>

              <div className="ml-auto hidden items-center gap-3 md:flex">
                <Button className="rounded-2xl border-border/80 bg-transparent text-slate-100 hover:bg-white/[0.04]" type="button" variant="outline">
                  <SquarePlus className="size-4" />
                  New Collection
                </Button>

                <Button className="rounded-2xl bg-white px-5 text-slate-900 hover:bg-slate-200">
                  <Plus className="size-4" />
                  New Item
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto bg-[#050507] px-8 py-10 lg:px-9">
            <section className="mb-12">
              <h1 className="text-[3rem] font-semibold tracking-[-0.04em] text-white">Dashboard</h1>
              <p className="mt-2 text-[1.05rem] text-slate-500">Your developer knowledge hub</p>
            </section>

            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-white">Collections</h2>
                <button className="text-[1.05rem] text-slate-400 transition hover:text-white" type="button">
                  View all
                </button>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {mockCollections.map((collection, index) => (
                  <DashboardCollectionCard collection={collection} index={index} key={collection.id} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center gap-3">
                <span className="text-muted-foreground">📌</span>
                <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-white">Pinned</h2>
              </div>

              <div className="space-y-4">
                {pinnedItems.map((item) => (
                  <DashboardPinnedItem item={item} key={item.id} />
                ))}
              </div>
            </section>
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

### Task 5: Full verification of the screenshot refactor

**Files:**
- No additional source files required beyond the refactor above.

- [ ] **Step 1: Run the full lint pass**

Run: `pnpm lint`
Expected: ESLint exits successfully.

- [ ] **Step 2: Run the full production build**

Run: `pnpm build`
Expected: Next.js completes the production build successfully and includes `/dashboard` in the route output.

- [ ] **Step 3: Verify `/dashboard` in the browser against the screenshots**

Confirm all of the following:
- sidebar reads like a flat app shell rather than a floating card
- top bar includes the centered search treatment and both right-side action buttons
- main content shows a dashboard heading, collections grid, and pinned items list
- mobile still opens the sidebar drawer correctly

- [ ] **Step 4: Confirm the final worktree state**

Run: `git status --short`
Expected: output shows only the intended dashboard refactor files and the design/plan docs for this refactor.

## Self-Review

- Spec coverage check:
- Sidebar refactor: covered in Task 3.
- Top bar restructure: covered in Task 4.
- Collections grid: covered in Tasks 2 and 4.
- Pinned items list: covered in Tasks 2 and 4.
- Darker, sharper visual language: covered in Tasks 3 and 4.
- Placeholder scan complete: no `TODO` or `TBD` markers remain.
- Type consistency check complete: `MockItem`, collection props, and pinned item props match across tasks.
