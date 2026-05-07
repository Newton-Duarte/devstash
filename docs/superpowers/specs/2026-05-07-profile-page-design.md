# Profile Page Design

## Summary

Add a protected `/profile` page that shows the signed-in user's account details, usage stats, and account actions. The page will stay server-rendered by default, with small client-side islands only where interaction is required for the password and delete-account flows.

## Goals

- Show the current user's name, email, avatar, and account creation date.
- Show aggregate usage stats: total items, total collections, and counts by item type.
- Allow credentials users to start a password-change flow from the profile page.
- Allow the user to permanently delete their account and owned data with explicit confirmation.
- Follow existing app patterns: protected route, server-side data loading, and server actions for mutations.

## Existing Context

- `src/app/profile/page.tsx` already exists as a protected page stub that reads the current session and renders the shared `UserAvatar`.
- `src/app/dashboard/page.tsx` already uses parallel server-side loading for independent data queries.
- Auth is handled through Auth.js with GitHub and credentials providers.
- The Prisma schema already cascades deletes from `User` to owned `items`, `collections`, `tags`, `accounts`, and `sessions`.

## Proposed Architecture

### Page composition

`/profile` remains a server component page.

It will render three sections:

1. Profile header
2. Usage stats
3. Account actions

The page will fetch all read-only data on the server before render.

### Data loading

Create a small profile-focused database helper that returns:

- user display fields: `name`, `email`, `image`, `createdAt`, `passwordHash`
- total item count
- total collection count
- item-type breakdown for the current user

Independent queries should run in parallel with `Promise.all`, consistent with the dashboard route.

### Account actions

Use server actions for account mutations.

- Change password action:
  - only available when the current user has a credentials password
  - verifies the current password
  - validates and hashes the new password
  - updates the user record and invalidates old sessions through the existing auth/session-version behavior
- Delete account action:
  - requires explicit confirmation in a dialog with a final destructive confirm button
  - verifies the acting user from the current session
  - deletes the current user record
  - relies on Prisma relation cascades to remove owned data
  - signs the user out and redirects to a public route

## UI Design

### Profile header

The existing profile card becomes a richer account summary.

Display:

- avatar using existing `UserAvatar`
- display name, falling back to email when no name exists
- email address
- formatted account creation date

Avatar behavior stays aligned with the current session data:

- use the GitHub image when present
- otherwise use initials derived from name or email through the shared avatar component

### Usage stats

Render a stats section with:

- total items
- total collections
- item-type breakdown cards or rows for snippets, prompts, notes, commands, links, files, and images

The breakdown should always render predictable labels, even when a count is zero.

### Account actions

Render two actions areas:

- password management
- danger zone

Password management:

- show only for credentials users
- use an inline form on `/profile` instead of a separate page to keep the feature self-contained

Danger zone:

- show a destructive delete-account control
- require explicit confirmation before submission
- explain that account deletion is permanent and removes owned data

## Data Rules

- The route remains protected by the existing proxy matcher and page-level auth check.
- The page should redirect unauthenticated users to `/sign-in`.
- Password-change UI should not render for OAuth-only users.
- Item breakdown counts should be scoped to the signed-in user's data only.
- Delete-account behavior is permanent, not recoverable.

## Error Handling

- Validation errors from password changes should return user-friendly form errors.
- Delete-account failures should return a safe generic message and leave the user signed in.
- If the session is missing during an action, redirect to `/sign-in`.
- If a user loses their account mid-request, treat them as signed out.

## Testing And Verification

Verify with:

- authenticated profile page load for credentials user
- authenticated profile page load for GitHub-only user
- password change success and invalid-password cases
- delete-account confirmation and post-delete redirect/sign-out behavior
- `pnpm build`

## Out Of Scope

- avatar uploads
- editing name or email
- subscription/billing management
- account recovery after deletion
