"use client";

import { Check, Copy, ExternalLink, Pencil, Pin, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteItem, updateItem } from "@/actions/items";
import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import { CodeEditor } from "@/components/items/code-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetCloseButton, SheetContent } from "@/components/ui/sheet";
import { type ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface ItemDetailDrawerProps {
  error: string | null;
  item: ItemDetail | null;
  loading: boolean;
  onItemDeleted: () => void;
  onItemUpdated: (item: ItemDetail) => void;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  open: boolean;
}

interface ItemEditValues {
  title: string;
  description: string;
  tags: string;
  content: string;
  language: string;
  url: string;
}

function ActionButton({
  active,
  children,
  className,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "size-10 rounded-full border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white",
        active && "text-[#facc15] hover:text-[#facc15]",
        className
      )}
      onClick={onClick}
      size="icon"
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  );
}

function EditField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">{label}</span>
      {children}
    </label>
  );
}

function getInitialEditValues(item: ItemDetail): ItemEditValues {
  return {
    title: item.title,
    description: item.description ?? "",
    tags: item.tags.join(", "),
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
  };
}

function toNullableString(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getCodeLanguage(typeName: string, language: string | null) {
  const trimmedLanguage = language?.trim();

  if (trimmedLanguage) {
    return trimmedLanguage;
  }

  return typeName === "command" ? "bash" : "typescript";
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

function ItemDetailContent({
  item,
  onItemDeleted,
  onItemUpdated,
}: {
  item: ItemDetail;
  onItemDeleted: () => void;
  onItemUpdated: (item: ItemDetail) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState(() => getInitialEditValues(item));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();

  const updateField = (field: keyof ItemEditValues, value: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const cancelEdit = () => {
    setFormValues(getInitialEditValues(item));
    setEditing(false);
  };

  const saveItem = () => {
    if (saving || !formValues.title.trim()) {
      return;
    }

    startSaving(async () => {
      const result = await updateItem(item.id, {
        title: formValues.title,
        description: toNullableString(formValues.description),
        content: toNullableString(formValues.content),
        language: toNullableString(formValues.language),
        url: toNullableString(formValues.url),
        tags: parseTags(formValues.tags),
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to update item.");
        return;
      }

      onItemUpdated(result.data);
      setFormValues(getInitialEditValues(result.data));
      setEditing(false);
      toast.success("Item updated.");
      router.refresh();
    });
  };

  const confirmDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (deleting) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteItem(item.id);

      if (!result.success) {
        toast.error(result.error ?? "Unable to delete item.");
        return;
      }

      setDeleteDialogOpen(false);
      onItemDeleted();
      toast.success("Item deleted.");
      router.refresh();
    });
  };

  const typeName = item?.type.name.toLowerCase() ?? "";
  const showContentField = ["snippet", "prompt", "command", "note"].includes(typeName);
  const showLanguageField = ["snippet", "command"].includes(typeName);
  const showUrlField = typeName === "link";
  const showCodeEditor = ["snippet", "command"].includes(typeName);

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {editing ? (
        <div className="flex items-center gap-3">
          <Button
            className="rounded-2xl"
            disabled={saving || !formValues.title.trim()}
            onClick={saveItem}
            type="button"
          >
            <Check className="size-4" />
            Save
          </Button>
          <Button
            className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
            disabled={saving}
            onClick={cancelEdit}
            type="button"
            variant="outline"
          >
            <X className="size-4" />
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ActionButton active={item.isFavorite} label="Favorite item">
            <Star className={cn("size-4", item.isFavorite && "fill-[#facc15] text-[#facc15]")} />
          </ActionButton>
          <ActionButton label="Pin item">
            <Pin className={cn("size-4", item.isPinned && "text-white")} />
          </ActionButton>
          <ActionButton label="Copy item">
            <Copy className="size-4" />
          </ActionButton>
          <ActionButton label="Edit item" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
          </ActionButton>
          <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <ActionButton className="ml-auto hover:text-red-300" label="Delete item">
                <Trash2 className="size-4" />
              </ActionButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove &quot;{item.title}&quot; from your stash. This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  disabled={deleting}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-2xl bg-red-500 text-white hover:bg-red-400"
                  disabled={deleting}
                  onClick={confirmDelete}
                >
                  {deleting ? "Deleting..." : "Delete item"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

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
            {editing ? (
              <div className="mt-5 space-y-4">
                <EditField label="Title">
                  <Input
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-base text-white placeholder:text-slate-600"
                    onChange={(event) => updateField("title", event.target.value)}
                    value={formValues.title}
                  />
                </EditField>
                <EditField label="Description">
                  <textarea
                    className="min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white shadow-xs outline-none transition-colors placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(event) => updateField("description", event.target.value)}
                    value={formValues.description}
                  />
                </EditField>
              </div>
            ) : (
              <>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {item.title}
                </h2>
                {item.description ? (
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
                ) : null}
              </>
            )}
          </div>
        </div>

        {editing ? (
          <EditField label="Tags">
            <Input
              className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
              onChange={(event) => updateField("tags", event.target.value)}
              placeholder="react, api, workflow"
              value={formValues.tags}
            />
          </EditField>
        ) : item.tags.length > 0 ? (
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

        {editing && (showContentField || showLanguageField || showUrlField) ? (
          <div className="grid gap-4">
            {showLanguageField ? (
              <EditField label="Language">
                <Input
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                  onChange={(event) => updateField("language", event.target.value)}
                  value={formValues.language}
                />
              </EditField>
            ) : null}

            {showUrlField ? (
              <EditField label="URL">
                <Input
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                  onChange={(event) => updateField("url", event.target.value)}
                  value={formValues.url}
                />
              </EditField>
            ) : null}

            {showContentField ? (
              <EditField label="Content">
                {showCodeEditor ? (
                  <CodeEditor
                    language={getCodeLanguage(typeName, formValues.language)}
                    onChange={(value) => updateField("content", value)}
                    value={formValues.content}
                  />
                ) : (
                  <textarea
                    className="min-h-52 w-full resize-y rounded-[1.25rem] border border-white/10 bg-[#050507] px-4 py-3 font-mono text-sm leading-6 text-slate-200 shadow-xs outline-none transition-colors placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(event) => updateField("content", event.target.value)}
                    value={formValues.content}
                  />
                )}
              </EditField>
            ) : null}
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

      {!editing && item.url ? (
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

      {!editing && item.content ? (
        showCodeEditor ? (
          <section className="space-y-3">
            <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">Content</p>
            <CodeEditor
              language={getCodeLanguage(typeName, item.language)}
              readOnly
              value={item.content}
            />
          </section>
        ) : (
          <section className="rounded-[1.75rem] border border-white/10 bg-[#050507] p-5">
            <p className="mb-4 text-xs font-medium tracking-[0.2em] text-slate-500 uppercase">
              Content
            </p>
            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
              {item.content}
            </pre>
          </section>
        )
      ) : null}
    </div>
  );
}

export function ItemDetailDrawer({
  error,
  item,
  loading,
  onItemDeleted,
  onItemUpdated,
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
            <ItemDetailContent
              item={item}
              key={item.id}
              onItemDeleted={onItemDeleted}
              onItemUpdated={onItemUpdated}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
