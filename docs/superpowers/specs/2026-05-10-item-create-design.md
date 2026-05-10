# Item Create Design

## Summary

Add item creation from the dashboard top bar through a shadcn Dialog. Users choose one supported item type and fill only the fields relevant to that type. Created items are saved without a collection, then the dashboard refreshes so counts and recent items update.

## Scope

- Open the create dialog from the existing dashboard `New Item` button.
- Support `snippet`, `prompt`, `command`, `note`, and `link` item types.
- Include shared fields for title, description, and comma-separated tags.
- Include content and language for snippets and commands.
- Include content for prompts and notes.
- Include URL for links.
- Do not include collection selection in this feature.
- Do not include file or image item creation in this feature.

## Recommended Approach

Create a dedicated `ItemCreateDialog` client component and mount it from `DashboardShell`. This keeps create-form state separate from the existing item detail drawer and matches the requested modal dialog flow. The component will follow existing dashboard styling and use the same toast and route refresh patterns already used by item update and delete.

## UI Behavior

The dialog defaults to the snippet type. The type selector controls which fields are visible:

- All types: title, description, tags.
- Snippet and command: content, language.
- Prompt and note: content.
- Link: URL.

The primary submit button is disabled while the create request is pending. The dialog remains open when validation or persistence fails so the user can correct the form. On success, the form resets, the dialog closes, a success toast appears, and the current route refreshes.

## Data Flow

The client component stores local form state, normalizes optional empty strings to `null`, parses comma-separated tags into a string array, and calls the `createItem` server action.

The server action checks the active session, validates input with a new Zod schema, and calls `lib/db/items.ts#createItem`. The database function resolves an allowed item type by name, limited to system types or types owned by the current user, creates the item, and connects or creates user tags in the same Prisma write.

## Validation

Validation lives in a new create item schema so it can be tested independently. The schema requires title for every item type. Links must include a valid URL. The schema allows content and language only where the UI exposes them, and optional empty fields are stored as `null`.

## Error Handling

The server action follows the existing `{ success, data, error }` pattern. It returns user-friendly errors for unauthenticated users, invalid input, missing item type records, and unexpected persistence failures. The client displays failures with `toast.error` and does not close the dialog.

## Testing

Add Vitest coverage for the create item schema because it contains meaningful branching by item type. Server action tests are not required if they would need heavy Auth.js and Prisma mocking; that should be noted during feature review.

## Implementation Notes

- Add shadcn Dialog primitives if the project does not already have them.
- Keep the create dialog focused on dashboard creation only.
- Preserve existing dashboard visual language and dark-first styling.
- Avoid unrelated refactors to the item drawer or item list pages.
