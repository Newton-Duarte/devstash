# Code Editor Design

## Summary

Add a reusable Monaco-based code editor for snippets and commands in the existing create dialog and item detail drawer. Prompts, notes, links, and other non-code item types keep their current inputs and display patterns.

## Goals

- Provide a dark Monaco editor experience for snippet and command content.
- Support editable and readonly modes with the same visual shell.
- Keep the scope limited to the current create dialog and detail drawer surfaces.
- Preserve existing form behavior, server actions, validation, and item type rules.
- Add a header with macOS window dots, language label, and copy action.
- Keep editor height fluid while capping visible editor space at 400px.

## Architecture

Create a client-only `CodeEditor` component that wraps Monaco and exposes a small prop API: `value`, `language`, `onChange`, `readOnly`, and optional presentation props such as placeholder or className if needed. Monaco should be loaded only on the client so the component remains compatible with Next.js server rendering boundaries.

The component owns editor-specific styling and options: dark theme, minimap disabled, line numbers enabled, smooth scrolling, themed scrollbar, readonly mode, and automatic layout. It also owns the reusable visual shell so create, edit, and display surfaces remain consistent.

## Integration Points

In `item-create-dialog.tsx`, the content field uses `CodeEditor` only when the selected type is `snippet` or `command`. Prompt and note content keep the existing textarea. The current language field remains visible for snippets and commands and provides the editor language, falling back to `typescript` for snippets and `bash` for commands when empty.

In `item-detail-drawer.tsx`, snippet and command content use `CodeEditor` in both edit mode and readonly display mode. Prompt and note editing keeps the existing textarea, and non-code readonly display keeps the current simple content block.

## UI Behavior

The editor shell uses the existing DevStash dark, rounded, glassy visual language. The header includes three macOS-style dots, a language label, and a copy button. The copy button writes the current editor value to the clipboard and shows success or failure feedback through the existing toast system.

The editor should be fluid enough to fit shorter content without feeling oversized while never exceeding 400px of visible editor height. Overflow should be handled by Monaco scrolling with scrollbar colors that match the dark theme.

## Error Handling

Clipboard failures should show a user-friendly error toast and should not block editing. Monaco loading should remain isolated to the editor component so the rest of the form and drawer keep their existing behavior.

## Testing

This feature is primarily client UI integration. Verification should include `pnpm lint`, `pnpm build`, and browser checks for creating, viewing, editing, and copying snippet and command content. No server-action or utility unit tests are expected unless the implementation introduces standalone testable helper logic.
