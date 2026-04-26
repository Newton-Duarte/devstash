# Dashboard UI Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial `/dashboard` screen with dark mode by default, minimal ShadCN setup, and display-only placeholders for the sidebar and main content.

**Architecture:** Keep the dashboard work local to the App Router by adding a dedicated `src/app/dashboard/page.tsx` route and a focused dashboard shell component. Add the minimum ShadCN setup needed now (`components.json`, `src/lib/utils.ts`, `button`, `input`) and update the global layout/styles only where required to support dark mode and the dashboard visual foundation.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, ESLint

---

## File Structure

- Create: `components.json`
  Purpose: shadcn/ui project configuration for aliases and style generation.
- Create: `src/lib/utils.ts`
  Purpose: shared `cn` helper required by shadcn/ui components.
- Create: `src/components/ui/button.tsx`
  Purpose: shadcn/ui button primitive for the top bar action.
- Create: `src/components/ui/input.tsx`
  Purpose: shadcn/ui input primitive for the top bar search field.
- Create: `src/components/dashboard/dashboard-shell.tsx`
  Purpose: presentational dashboard shell with top bar, sidebar placeholder, and main placeholder.
- Create: `src/app/dashboard/page.tsx`
  Purpose: App Router entrypoint for `/dashboard`.
- Modify: `src/app/layout.tsx`
  Purpose: set dark mode at the root and keep global page sizing consistent.
- Modify: `src/app/globals.css`
  Purpose: add Tailwind v4 theme tokens and base dark-mode styles used by the dashboard shell.
- Modify: `package.json`
  Purpose: add runtime dependencies required by minimal shadcn/ui setup.

### Task 1: Create the feature branch and install minimal shadcn dependencies

**Files:**
- Modify: `package.json`
- Create: `components.json`

- [ ] **Step 1: Create and switch to the feature branch**

Run: `git switch -c feature/dashboard-phase-1`
Expected: shell prints `Switched to a new branch 'feature/dashboard-phase-1'`

- [ ] **Step 2: Install the minimum runtime dependencies for shadcn/ui**

Run: `pnpm add class-variance-authority clsx tailwind-merge lucide-react`
Expected: install completes successfully and `package.json` plus `pnpm-lock.yaml` are updated.

- [ ] **Step 3: Add shadcn project configuration**

Create `components.json` with:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 4: Verify the dependency and config changes are present**

Run: `git diff -- package.json pnpm-lock.yaml components.json`
Expected: diff shows the new dependencies and the new `components.json` file.

### Task 2: Add the minimal shadcn primitives

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`

- [ ] **Step 1: Add the shared `cn` helper**

Create `src/lib/utils.ts` with:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Add the button component**

Create `src/components/ui/button.tsx` with:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
```

- [ ] **Step 3: Add the input component**

Create `src/components/ui/input.tsx` with:

```tsx
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
```

- [ ] **Step 4: Run lint on the new primitives**

Run: `pnpm lint src/lib/utils.ts src/components/ui/button.tsx src/components/ui/input.tsx`
Expected: command exits successfully with no lint errors.

### Task 3: Add dark theme tokens and root layout defaults

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace the minimal global stylesheet with dark-mode-first tokens and base styles**

Update `src/app/globals.css` to:

```css
@import "tailwindcss";

@theme inline {
  --color-background: oklch(0.19 0.02 262);
  --color-foreground: oklch(0.97 0.01 255);
  --color-card: oklch(0.23 0.02 262);
  --color-card-foreground: oklch(0.97 0.01 255);
  --color-popover: oklch(0.23 0.02 262);
  --color-popover-foreground: oklch(0.97 0.01 255);
  --color-primary: oklch(0.72 0.17 255);
  --color-primary-foreground: oklch(0.98 0.01 255);
  --color-secondary: oklch(0.28 0.02 262);
  --color-secondary-foreground: oklch(0.97 0.01 255);
  --color-muted: oklch(0.28 0.02 262);
  --color-muted-foreground: oklch(0.72 0.02 255);
  --color-accent: oklch(0.28 0.02 262);
  --color-accent-foreground: oklch(0.97 0.01 255);
  --color-border: oklch(0.33 0.02 262);
  --color-input: oklch(0.25 0.02 262);
  --color-ring: oklch(0.72 0.17 255);
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@layer base {
  * {
    @apply border-border;
  }

  html {
    color-scheme: dark;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

- [ ] **Step 2: Make dark mode explicit in the root layout**

Update `src/app/layout.tsx` to:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevStash",
  description: "Centralized developer knowledge hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run a focused build check on the updated app shell**

Run: `pnpm build`
Expected: Next.js build finishes successfully.

### Task 4: Build the dashboard route and shell

**Files:**
- Create: `src/components/dashboard/dashboard-shell.tsx`
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add the dashboard shell component**

Create `src/components/dashboard/dashboard-shell.tsx` with:

```tsx
import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search items"
              className="pl-10"
              placeholder="Search snippets, prompts, notes, and commands"
            />
          </div>

          <Button className="w-full sm:w-auto">
            <Plus className="size-4" />
            New Item
          </Button>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <h2 className="text-lg font-semibold">Sidebar</h2>
          </aside>

          <main className="rounded-3xl border border-dashed border-border bg-card/60 p-6">
            <h2 className="text-lg font-semibold">Main</h2>
          </main>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the route entrypoint**

Create `src/app/dashboard/page.tsx` with:

```tsx
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardPage() {
  return <DashboardShell />;
}
```

- [ ] **Step 3: Verify the route compiles cleanly**

Run: `pnpm exec tsc --noEmit`
Expected: TypeScript exits successfully with no errors.

### Task 5: Full verification and current-feature update

**Files:**
- Modify: `context/current-feature.md`

- [ ] **Step 1: Run the full lint pass**

Run: `pnpm lint`
Expected: ESLint exits successfully.

- [ ] **Step 2: Run the full production build**

Run: `pnpm build`
Expected: Next.js completes the production build successfully.

- [ ] **Step 3: Mark the feature as completed after verification succeeds**

Update `context/current-feature.md` so the relevant sections read:

```md
## Status

Completed

## History

<!-- Keep this updated. Earliest to latest -->

- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
```

- [ ] **Step 4: Confirm the final diff**

Run: `git status --short`
Expected: only the intended dashboard and context/spec files are modified or added.

## Self-Review

- Spec coverage check:
- ShadCN initialization and components: covered in Tasks 1 and 2.
- `/dashboard` route: covered in Task 4.
- Main dashboard layout and global styles: covered in Tasks 3 and 4.
- Dark mode by default: covered in Task 3.
- Top bar with search and new item button: covered in Task 4.
- Sidebar and main placeholders: covered in Task 4.
- Placeholder scan complete: no `TODO`/`TBD` markers remain.
- Type consistency check complete: imports, aliases, and component names match across tasks.
