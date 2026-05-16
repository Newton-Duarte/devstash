"use client";

import { Download, File, FileCode2, FileText, Pin } from "lucide-react";

import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button";
import { type ItemListItem } from "@/lib/db/item-list";

interface FileListRowProps {
  item: ItemListItem;
  onOpen: (itemId: string) => void;
}

function getFileExtension(fileName: string | null) {
  if (!fileName) {
    return "file";
  }

  const extensionStart = fileName.lastIndexOf(".");

  if (extensionStart === -1) {
    return "file";
  }

  return fileName.slice(extensionStart + 1).toUpperCase();
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileExtensionIcon({ extension }: { extension: string }) {
  if (["MD", "PDF", "TXT"].includes(extension)) {
    return <FileText className="size-5" />;
  }

  if (["JSON", "XML", "YAML", "YML", "TOML", "INI"].includes(extension)) {
    return <FileCode2 className="size-5" />;
  }

  return <File className="size-5" />;
}

export function FileListRow({ item, onOpen }: FileListRowProps) {
  const extension = getFileExtension(item.fileName);
  const downloadUrl = `/api/items/${item.id}/download`;

  return (
    <article
      className="group relative grid cursor-pointer gap-4 rounded-2xl border border-white/10 bg-[#0a0a0c] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.04] sm:grid-cols-[minmax(0,1fr)_120px_120px_auto] sm:items-center"
    >
      <button
        aria-label={`Open details for ${item.title}`}
        className="absolute inset-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => onOpen(item.id)}
        type="button"
      />

      <div className="pointer-events-none relative flex min-w-0 items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition group-hover:border-white/20 group-hover:text-white">
          <FileExtensionIcon extension={extension} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-white sm:text-[0.98rem]">
              {item.fileName ?? item.title}
            </h2>
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
              {extension}
            </span>
            {item.isPinned ? <Pin className="size-4 shrink-0 text-muted-foreground" /> : null}
            <FavoriteToggleButton
              className="pointer-events-auto relative z-10 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              id={item.id}
              isFavorite={item.isFavorite}
              label={`${item.isFavorite ? "Unfavorite" : "Favorite"} ${item.title}`}
              resource="item"
            />
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>

      <div className="pointer-events-none relative text-sm text-slate-300">
        <span className="mb-1 block text-[0.68rem] font-medium tracking-[0.18em] text-slate-500 uppercase sm:hidden">
          Size
        </span>
        {formatFileSize(item.fileSize)}
      </div>

      <div className="pointer-events-none relative text-sm text-slate-300">
        <span className="mb-1 block text-[0.68rem] font-medium tracking-[0.18em] text-slate-500 uppercase sm:hidden">
          Uploaded
        </span>
        {item.createdAtLabel}
      </div>

      <a
        aria-label={`Download ${item.fileName ?? item.title}`}
        className="relative z-10 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-auto"
        download
        href={downloadUrl}
        onClick={(event) => event.stopPropagation()}
      >
        <Download className="size-4" />
        <span className="sm:sr-only">Download</span>
      </a>
    </article>
  );
}
