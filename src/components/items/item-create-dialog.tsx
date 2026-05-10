"use client";

import { Code2, Link2, MessageSquareQuote, NotebookPen, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type ComponentType,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { createItem } from "@/actions/items";
import { CodeEditor } from "@/components/items/code-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type CreateItemType } from "@/lib/items/create-item-schema";
import { cn } from "@/lib/utils";

interface ItemCreateDialogProps {
  children: ReactNode;
}

interface ItemCreateValues {
  type: CreateItemType;
  title: string;
  description: string;
  tags: string;
  content: string;
  language: string;
  url: string;
}

const itemTypes = [
  {
    type: "snippet",
    label: "Snippet",
    description: "Reusable code and patterns",
    icon: Code2,
    color: "#3b82f6",
  },
  {
    type: "prompt",
    label: "Prompt",
    description: "AI instructions and workflows",
    icon: MessageSquareQuote,
    color: "#8b5cf6",
  },
  {
    type: "command",
    label: "Command",
    description: "Terminal commands and scripts",
    icon: Terminal,
    color: "#f97316",
  },
  {
    type: "note",
    label: "Note",
    description: "Ideas, docs, and reminders",
    icon: NotebookPen,
    color: "#fde047",
  },
  {
    type: "link",
    label: "Link",
    description: "Bookmarks and references",
    icon: Link2,
    color: "#10b981",
  },
] satisfies Array<{
  type: CreateItemType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: string;
}>;

const initialValues: ItemCreateValues = {
  type: "snippet",
  title: "",
  description: "",
  tags: "",
  content: "",
  language: "",
  url: "",
};

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

function getCodeLanguage(type: CreateItemType, language: string) {
  const trimmedLanguage = language.trim();

  if (trimmedLanguage) {
    return trimmedLanguage;
  }

  return type === "command" ? "bash" : "typescript";
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
      {children}
    </span>
  );
}

export function ItemCreateDialog({ children }: ItemCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ItemCreateValues>(initialValues);
  const [creating, startCreating] = useTransition();

  const selectedType = values.type;
  const showContentField = ["snippet", "prompt", "command", "note"].includes(selectedType);
  const showLanguageField = ["snippet", "command"].includes(selectedType);
  const showUrlField = selectedType === "link";
  const showCodeEditor = ["snippet", "command"].includes(selectedType);

  const updateField = (field: keyof ItemCreateValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const updateOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setValues(initialValues);
    }
  };

  const submitItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (creating || !values.title.trim()) {
      return;
    }

    startCreating(async () => {
      const result = await createItem({
        type: values.type,
        title: values.title,
        description: toNullableString(values.description),
        content: toNullableString(values.content),
        language: toNullableString(values.language),
        url: toNullableString(values.url),
        tags: parseTags(values.tags),
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to create item.");
        return;
      }

      setValues(initialValues);
      setOpen(false);
      toast.success("Item created.");
      router.refresh();
    });
  };

  return (
    <Dialog onOpenChange={updateOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="pr-10">
          <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
            New resource
          </p>
          <DialogTitle>Create item</DialogTitle>
          <DialogDescription>
            Pick an item type, add the details you need, and save it to your stash.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={submitItem}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {itemTypes.map((itemType) => {
              const Icon = itemType.icon;
              const selected = selectedType === itemType.type;

              return (
                <button
                  aria-pressed={selected}
                  className={cn(
                    "rounded-3xl border p-3 text-left transition hover:border-white/20 hover:bg-white/[0.05]",
                    selected
                      ? "border-white/25 bg-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                  key={itemType.type}
                  onClick={() => updateField("type", itemType.type)}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Icon className="size-5" style={{ color: itemType.color }} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{itemType.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {itemType.description}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <FieldLabel>Title</FieldLabel>
              <Input
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="React debounce hook"
                required
                value={values.title}
              />
            </label>

            <label className="block space-y-2 sm:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <Input
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Short context for this item"
                value={values.description}
              />
            </label>

            {showUrlField ? (
              <label className="block space-y-2 sm:col-span-2">
                <FieldLabel>URL</FieldLabel>
                <Input
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                  onChange={(event) => updateField("url", event.target.value)}
                  placeholder="https://example.com"
                  required
                  type="url"
                  value={values.url}
                />
              </label>
            ) : null}

            {showContentField ? (
              <label className="block space-y-2 sm:col-span-2">
                <FieldLabel>Content</FieldLabel>
                {showCodeEditor ? (
                  <CodeEditor
                    language={getCodeLanguage(selectedType, values.language)}
                    onChange={(value) => updateField("content", value)}
                    value={values.content}
                  />
                ) : (
                  <textarea
                    className="min-h-36 w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white shadow-xs outline-none transition-colors placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(event) => updateField("content", event.target.value)}
                    placeholder="Paste the snippet, prompt, command, or note body..."
                    value={values.content}
                  />
                )}
              </label>
            ) : null}

            {showLanguageField ? (
              <label className="block space-y-2">
                <FieldLabel>Language</FieldLabel>
                <Input
                  className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                  onChange={(event) => updateField("language", event.target.value)}
                  placeholder={selectedType === "command" ? "bash" : "typescript"}
                  value={values.language}
                />
              </label>
            ) : null}

            <label className={cn("block space-y-2", showLanguageField ? "" : "sm:col-span-2")}>
              <FieldLabel>Tags</FieldLabel>
              <Input
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="react, hooks, frontend"
                value={values.tags}
              />
            </label>
          </div>

          <DialogFooter>
            <Button
              className="rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/[0.04]"
              disabled={creating}
              onClick={() => updateOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-2xl bg-white px-5 text-slate-900 hover:bg-slate-200"
              disabled={creating || !values.title.trim() || (showUrlField && !values.url.trim())}
              type="submit"
            >
              {creating ? "Creating..." : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
