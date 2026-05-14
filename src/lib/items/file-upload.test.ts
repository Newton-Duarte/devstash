import { describe, expect, it } from "vitest";

import { createR2ObjectKey, getFileExtension, validateUploadFile } from "@/lib/items/file-upload";

describe("file upload validation", () => {
  it("accepts allowed image extensions and MIME types", () => {
    const result = validateUploadFile({
      fileName: "diagram.PNG",
      fileSize: 1024,
      mimeType: "image/png",
      type: "image",
    });

    expect(result).toBeNull();
  });

  it("rejects oversized files", () => {
    const result = validateUploadFile({
      fileName: "archive.pdf",
      fileSize: 11 * 1024 * 1024,
      mimeType: "application/pdf",
      type: "file",
    });

    expect(result).toBe("Files must be 10.0 MB or smaller.");
  });

  it("rejects mismatched MIME types", () => {
    const result = validateUploadFile({
      fileName: "notes.md",
      fileSize: 1024,
      mimeType: "application/octet-stream",
      type: "file",
    });

    expect(result).toBe("Unsupported file type.");
  });

  it("normalizes file extensions", () => {
    expect(getFileExtension("README.MD")).toBe(".md");
  });
});

describe("createR2ObjectKey", () => {
  it("creates user-scoped sanitized object keys", () => {
    const key = createR2ObjectKey({
      fileName: "My Diagram (Final).PNG",
      type: "image",
      userId: "user_123",
    });

    expect(key).toMatch(/^user_123\/image\/[a-f0-9-]+-my-diagram-final-.png$/);
  });
});
