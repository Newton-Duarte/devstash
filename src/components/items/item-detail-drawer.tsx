"use client";

import { Copy, ExternalLink, Pencil, Pin, Star, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetCloseButton, SheetContent } from "@/components/ui/sheet";
import { type ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface ItemDetailDrawerProps {
  error: string | null;
  item: ItemDetail | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  open: boolean;
}

function ActionButton({
  active,
  children,
  className,
  label,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "size-10 rounded-full border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white",
        active && "text-[#facc15] hover:text-[#facc15]",
        className
      )}
      size="icon"
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  );
}

function ItemDrawerSkeleton() {
  return (
    <div className="space-y-8 p-6 sm:p-8">
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-9 w-4/5 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-3xl bg-white/[0.06]" />
        <div className="h-24 animate-pulse rounded-3xl bg-white/[0.06]" />
      </div>
      <div className="h-44 animate-pulse rounded-[1.75rem] bg-white/[0.06]" />
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">{label}</p>
      <p className="mt-2 break-words text-sm text-slate-200">{value}</p>
    </div>
  );
}

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return null;
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ItemDetailDrawer({
  error,
  item,
  loading,
  onOpenChange,
  onRetry,
  open,
}: ItemDetailDrawerProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent aria-label="Item details" onOpenChange={onOpenChange} open={open}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
              Item Details
            </p>
            <p className="mt-1 text-sm text-slate-400">View saved resource details</p>
          </div>
          <SheetCloseButton onClick={() => onOpenChange(false)} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? <ItemDrawerSkeleton /> : null}

          {!loading && error ? (
            <div className="flex min-h-full items-center justify-center p-8 text-center">
              <div className="max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
                <p className="text-lg font-semibold text-white">Unable to load item</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{error}</p>
                <Button className="mt-6 rounded-2xl" onClick={onRetry} type="button">
                  Try again
                </Button>
              </div>
            </div>
          ) : null}

          {!loading && !error && item ? (
            <div className="space-y-8 p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <ActionButton active={item.isFavorite} label="Favorite item">
                  <Star
                    className={cn(
                      "size-4",
                      item.isFavorite && "fill-[#facc15] text-[#facc15]"
                    )}
                  />
                </ActionButton>
                <ActionButton label="Pin item">
                  <Pin className={cn("size-4", item.isPinned && "text-white")} />
                </ActionButton>
                <ActionButton label="Copy item">
                  <Copy className="size-4" />
                </ActionButton>
                <ActionButton label="Edit item">
                  <Pencil className="size-4" />
                </ActionButton>
                <ActionButton className="ml-auto hover:text-red-300" label="Delete item">
                  <Trash2 className="size-4" />
                </ActionButton>
              </div>

              <section>
                <div className="mb-5 flex items-start gap-4">
                  <div
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${item.type.color ?? "#334155"}1f` }}
                  >
                    <DashboardItemTypeIcon className="size-6" type={item.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-xl border border-white/10 px-3 py-1 text-xs font-medium capitalize"
                        style={{
                          backgroundColor: `${item.type.color ?? "#334155"}18`,
                          color: item.type.color ?? "#cbd5e1",
                        }}
                      >
                        {item.type.name}
                      </span>
                      {item.language ? (
                        <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
                          {item.language}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                </div>

                {item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        className="rounded-xl border border-white/10 bg-[#16161b] px-3 py-1 text-xs font-medium text-slate-300"
                        key={`${item.id}-${tag}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <DetailField label="Collection" value={item.collection?.name ?? null} />
                <DetailField label="Content Type" value={item.contentType} />
                <DetailField label="Updated" value={item.updatedAtLabel} />
                <DetailField label="Created" value={item.createdAtLabel} />
                <DetailField label="File Name" value={item.fileName} />
                <DetailField label="File Size" value={formatFileSize(item.fileSize)} />
              </section>

              {item.url ? (
                <a
                  className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
                  href={item.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="size-4 shrink-0 text-slate-500" />
                  <span className="break-all">{item.url}</span>
                </a>
              ) : null}

              {item.content ? (
                <section className="rounded-[1.75rem] border border-white/10 bg-[#050507] p-5">
                  <p className="mb-4 text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
                    Content
                  </p>
                  <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
                    {item.content}
                  </pre>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
