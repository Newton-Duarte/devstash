# Current Feature: Item Create

## Status

In Progress

## Goals

- Add a modal dialog opened from the top bar "New Item" button for creating new items.
- Support selecting item type for snippet, prompt, command, note, and link.
- Show type-specific fields with required title for all item types and required URL for links.
- Add a Zod-validated `createItem` server action.
- Add a `createItem` query function in `lib/db/items.ts`.
- Show a success toast, close the modal, and refresh after item creation.

## Notes

- Spec source: `context/features/item-create-spec.md`
- Use the shadcn Dialog component.
- Shared fields: title, description, and tags.
- Snippet and command fields: content and language.
- Prompt and note fields: content.
- Link fields: URL.

## History

- **Items List Three Column Layout** - Updated the protected `/items/[type]` listing grid to keep two columns at `md` and expand to three columns at `lg` and above while preserving the existing responsive item card layout (Completed)
- **Items List View** - Added the protected `/items/[type]` dynamic route with type-filtered item loading, a two-column item card grid, and shared item-type route mapping for sidebar and item pages (Completed)
- **Dashboard Item Card Accent Match** - Updated dashboard pinned and recent item cards to use the same left accent shell treatment as collection cards while preserving item-type accent colors and existing content layouts (Completed)
- **Initial Setup** - Next.js 16, Tailwind CSS v4, TypeScript configured (Completed)
- **Dashboard UI Phase 1** - Dashboard shell, route, dark mode, ShadCN setup, and placeholders completed (Completed)
- **Dashboard UI Phase 2** - Responsive sidebar, mobile drawer, mock-data navigation, collections, and user area completed (Completed)
- **Dashboard UI Phase 3** - Dashboard stats, recent collections, pinned items, and recent items completed (Completed)
- **Database Foundation** - Prisma 7, Neon PostgreSQL config, initial schema, shared Prisma client, and first migration completed (Completed)
- **Seed Data** - Prisma seed script, demo user, system item types, collections, and sample items completed (Completed)
- **Dashboard Collections** - Dashboard recent collections now load from Prisma with derived type colors, icons, and collection stats (Completed)
- **Dashboard Items** - Dashboard pinned and recent items now load from Prisma with item-type accents, icons, and item stats (Completed)
- **Stats And Sidebar** - Dashboard sidebar item types and collection lists now load from Prisma with plural item routes, recent collection color indicators, and view-all collections link (Completed)
- **Add Pro Badge To Sidebar** - Added subtle uppercase PRO badges to the Files and Images sidebar item types using a reusable ShadCN-style badge component (Completed)
- **Auth Setup - NextAuth + GitHub Provider** - Added Auth.js v5 split config, Prisma-backed sessions, GitHub sign-in, and `/dashboard` proxy protection (Completed)
- **Auth Credentials - Email/Password Provider** - Added email/password registration, bcrypt-validated credentials sign-in, and Auth.js Credentials support while preserving GitHub OAuth (Completed)
- **Auth UI - Sign In, Register & Sign Out** - Replaced the default Auth.js pages with custom sign-in and register flows, added a reusable authenticated avatar menu, and wired dashboard/profile auth UI to the real session user (Completed)
- **Setup Email Verification On Register** - Added Resend-backed email verification, link-based verification and resend flows, and blocked credentials sign-in until email verification is complete while preserving GitHub OAuth (Completed)
- **Add Configurable Email Verification Toggle** - Added an environment-driven email verification toggle so credentials registration/sign-in can bypass verification when disabled while preserving the Resend verification flow when enabled (Completed)
- **Create Forgot Password Flow** - Added forgot-password and reset-password flows backed by `VerificationToken`, reset email delivery, password reset completion, and auth hardening for trusted email origins and session invalidation after reset (Completed)
- **Profile Page** - Added a protected profile route with account details, usage stats, inline password changes for credentials users, and permanent account deletion with confirmation (Completed)
- **Rate Limiting For Auth** - Added Upstash-backed rate limiting for credentials sign-in, registration, password reset flows, and verification email resends with user-facing feedback and fail-open behavior when Redis is unavailable (Completed)
- **Vitest Setup For Server Utilities** - Added a minimal Node-based Vitest setup, initial unit tests for server-side utility modules, and updated workflow/docs to require utility and lightweight server-action testing without adding component tests (Completed)
- **Item Drawer** - Added a reusable right-side item detail drawer with authenticated click-to-fetch item details from dashboard and item list cards, loading/error states, accessible card activation, and display-only action controls (Completed)
- **Item Drawer Edit Mode** - Added inline editing to the item detail drawer with Save/Cancel controls, authenticated Zod-validated updates, type-specific fields, tag replacement, route refresh, toasts, and validation tests (Completed)
- **Item Delete Functionality** - Added authenticated drawer-based item deletion with a ShadCN-style confirmation dialog, route refresh, and success/error toasts (Completed)
