# File Upload with Cloudflare R2 Design

## Overview

Add file and image uploads to DevStash using Cloudflare R2. Uploads use a two-step flow: the browser uploads the file to an authenticated upload route first, then creates the item with the returned file metadata. Downloads and image previews are served through authenticated app routes instead of direct R2 URLs.

## Goals

- Support File and Image item creation from the existing create item dialog.
- Store uploaded objects in Cloudflare R2 with user-scoped object keys.
- Store R2 metadata on items so files can be downloaded, previewed, and deleted reliably.
- Keep Prisma database operations in `src/lib/db/items.ts`.
- Avoid CORS and public bucket assumptions by serving downloads and image previews through a proxy route.
- Validate file type and size against the feature spec before upload.

## Architecture

Add a `fileKey` column to `Item`. `fileKey` stores the private R2 object key and is the source of truth for download and deletion. Existing item fields continue to store display metadata: `fileName`, `fileSize`, `fileUrl`, and `contentType`.

Add `src/lib/r2.ts` for server-only R2 integration. It owns client setup, object key generation, file constraints, metadata normalization, upload, download, and delete helpers. Validation constants live here or in a small upload utility so API routes and tests use the same rules.

Add `POST /api/uploads`. The route authenticates the user, accepts multipart form data, validates the requested item type and file, uploads the object to R2, and returns the metadata needed to create an item.

Add `GET /api/items/[id]/download`. The route authenticates the user, fetches the owned item, reads the object by `fileKey`, and streams it with safe response headers. This route is used for file downloads and image previews.

## UI And Data Flow

Expand item creation to include `file` and `image` item types. Selecting one of those types shows a reusable `FileUpload` component instead of text content or URL fields.

`FileUpload` is a client component with drag-and-drop, browse fallback, selected-file summary, type-specific accept rules, size validation, upload progress, and image preview after upload. It uploads to `/api/uploads` and returns uploaded metadata to the parent dialog.

The create dialog keeps submit disabled until the title is present and the selected file has uploaded successfully. On submit, it calls the existing `createItem` server action with the uploaded metadata. If item creation fails after upload succeeds, the dialog keeps the uploaded metadata in place so the user can retry without re-uploading.

The item drawer shows file name and formatted size for file and image items. File items get a download button. Image items show a preview loaded from the authenticated download route and can use the same proxy route for download behavior.

## Validation Rules

Images allow `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, and `.svg` up to 5 MB. Allowed MIME types are `image/png`, `image/jpeg`, `image/gif`, `image/webp`, and `image/svg+xml`.

Files allow `.pdf`, `.txt`, `.md`, `.json`, `.yaml`, `.yml`, `.xml`, `.csv`, `.toml`, and `.ini` up to 10 MB. Allowed MIME types are `application/pdf`, `text/plain`, `text/markdown`, `application/json`, `application/x-yaml`, `text/yaml`, `application/xml`, `text/xml`, `text/csv`, and `application/toml`.

`createItemSchema` adds `file` and `image` item types. Uploaded file metadata is required only for those types. Text, link, file, and image fields remain isolated by type so unrelated fields do not leak across item variants.

## Deletion

Deletion fetches the owned item first, deletes the database item, then attempts R2 deletion when `fileKey` exists. If R2 deletion fails after the database delete, the UI still treats the item as deleted. The failure is a cleanup risk, not a reason to resurrect the deleted item in the UI.

## Testing

Add or update Vitest coverage for file validation rules, create schema requirements, and pure R2 key or metadata helpers. Route handlers and actual R2 operations depend on Auth.js, multipart request parsing, and external storage, so they are better verified through lint, build, and the browser flow rather than deep mocks.

## Implementation Notes

- Use API routes for upload and download because file uploads need progress tracking and specific HTTP response headers.
- Keep database item creation and deletion logic in `src/lib/db/items.ts`.
- Do not require `R2_PUBLIC_URL`; the app proxy route is the supported access path for this feature.
- Add required R2 environment handling with clear errors when credentials are missing.
