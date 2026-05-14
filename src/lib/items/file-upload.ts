export type UploadItemType = "file" | "image";

export interface UploadedFileMetadata {
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  fileUrl?: string | null;
}

interface UploadConstraint {
  maxSize: number;
  extensions: readonly string[];
  mimeTypes: readonly string[];
}

export const FILE_UPLOAD_CONSTRAINTS = {
  image: {
    maxSize: 5 * 1024 * 1024,
    extensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    mimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"],
  },
  file: {
    maxSize: 10 * 1024 * 1024,
    extensions: [".pdf", ".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".csv", ".toml", ".ini"],
    mimeTypes: [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/json",
      "application/x-yaml",
      "text/yaml",
      "application/xml",
      "text/xml",
      "text/csv",
      "application/toml",
    ],
  },
} satisfies Record<UploadItemType, UploadConstraint>;

export function getFileExtension(fileName: string) {
  const extensionStart = fileName.lastIndexOf(".");

  if (extensionStart === -1) {
    return "";
  }

  return fileName.slice(extensionStart).toLowerCase();
}

export function getAcceptedFileTypes(type: UploadItemType) {
  const constraints = FILE_UPLOAD_CONSTRAINTS[type];

  return [...constraints.extensions, ...constraints.mimeTypes].join(",");
}

export function formatUploadFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "upload";
}

export function createR2ObjectKey({
  fileName,
  type,
  userId,
}: {
  fileName: string;
  type: UploadItemType;
  userId: string;
}) {
  return `${userId}/${type}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function validateUploadFile({
  fileName,
  fileSize,
  mimeType,
  type,
}: {
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: UploadItemType;
}) {
  const constraints = FILE_UPLOAD_CONSTRAINTS[type];
  const extension = getFileExtension(fileName);

  if (fileSize <= 0) {
    return "Choose a non-empty file.";
  }

  if (fileSize > constraints.maxSize) {
    return `${type === "image" ? "Images" : "Files"} must be ${formatUploadFileSize(constraints.maxSize)} or smaller.`;
  }

  if (!constraints.extensions.includes(extension)) {
    return `Unsupported file extension. Allowed: ${constraints.extensions.join(", ")}.`;
  }

  if (!constraints.mimeTypes.includes(mimeType)) {
    return "Unsupported file type.";
  }

  return null;
}
