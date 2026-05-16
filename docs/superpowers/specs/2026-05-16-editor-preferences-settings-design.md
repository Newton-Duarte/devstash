# Editor Preferences Settings Design

## Overview

Add global editor preferences for each user. Preferences are managed from the protected settings page, saved automatically, and applied to every Monaco code editor used for snippets and commands.

## Goals

- Add editor preference controls to the settings page.
- Store preferences as a JSON value on the authenticated user record.
- Create and run a Prisma migration for the new user field.
- Add an authenticated server action for updates.
- Provide preferences to client components through context.
- Apply preferences to the Monaco editor component.
- Auto-save changes without a save button.
- Show a success toast after a successful save.

## Data Model

Add a nullable `editorPreferences` JSON field to `User`. The application will merge stored values with defaults before rendering or applying preferences.

Defaults:

- Word wrap: on
- Minimap: off
- Theme: `vs-dark`
- Font size: current editor default
- Tab size: current editor default

Supported themes:

- `vs-dark`
- `monokai`
- `github-dark`

## Server Flow

Create a focused server action that:

- Requires an authenticated session.
- Validates the incoming preference object with Zod.
- Updates only the current user's `editorPreferences` value.
- Returns the existing action shape: `{ success, data, error }`.

The server action should not accept a user ID from the client.

## Client Flow

The settings page will fetch the authenticated user's saved preferences, merge them with defaults, and render a new editor preferences section.

The preferences UI will auto-save each change. On successful save, it updates local context state and shows a success toast. On failure, it shows an error toast and keeps the prior valid settings visible.

## Context

Create `EditorPreferencesContext` for client components. It will expose:

- The current normalized editor preferences.
- A setter for updating preferences after successful saves.

The provider should be mounted around the settings and dashboard content where Monaco editors are used, so `CodeEditor` can read preferences without prop drilling.

## Monaco Integration

Update `CodeEditor` to read preferences from context and apply:

- Font size
- Tab size
- Word wrap
- Minimap
- Theme

The editor should preserve its existing read-only behavior, copy action, dynamic height, language normalization, and current styling.

## Error Handling

- Invalid input returns a user-friendly action error.
- Unauthenticated requests return a sign-in error.
- Failed saves show an error toast.
- Missing or partial stored JSON falls back to defaults.

## Testing

Add or update Vitest coverage for the pure preference validation/default-merging utilities. The server action depends on Auth.js and Prisma, so test it only if it can be done without heavy mocking.

Manual verification should confirm:

- Settings controls render with defaults for users without saved preferences.
- Changing a control auto-saves and shows a success toast.
- Snippet and command editors reflect saved preferences.
- Reloading preserves the saved preferences.
