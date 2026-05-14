"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

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

interface CollectionCreateDialogProps {
  children: ReactNode;
}

interface CollectionCreateValues {
  name: string;
  description: string;
}

const initialValues: CollectionCreateValues = {
  name: "",
  description: "",
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
      {children}
    </span>
  );
}

function toNullableString(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

export function CollectionCreateDialog({ children }: CollectionCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CollectionCreateValues>(initialValues);
  const [creating, startCreating] = useTransition();

  const updateField = (field: keyof CollectionCreateValues, value: string) => {
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

  const submitCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (creating || !values.name.trim()) {
      return;
    }

    startCreating(async () => {
      try {
        const response = await fetch("/api/collections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            description: toNullableString(values.description),
          }),
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          toast.error(result.error ?? "Unable to create collection.");
          return;
        }
      } catch {
        toast.error("Unable to create collection.");
        return;
      }

      setValues(initialValues);
      setOpen(false);
      toast.success("Collection created.");
      router.refresh();
    });
  };

  return (
    <Dialog onOpenChange={updateOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader className="pr-10">
          <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
            New collection
          </p>
          <DialogTitle>Create collection</DialogTitle>
          <DialogDescription>
            Group related snippets, prompts, files, and notes into a focused workspace.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={submitCollection}>
          <div className="grid gap-4">
            <label className="block space-y-2">
              <FieldLabel>Name</FieldLabel>
              <Input
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="React Patterns"
                required
                value={values.name}
              />
            </label>

            <label className="block space-y-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                className="min-h-28 w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white shadow-xs outline-none transition-colors placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Reusable hooks, component patterns, and frontend references."
                value={values.description}
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
              disabled={creating || !values.name.trim()}
              type="submit"
            >
              {creating ? "Creating..." : "Create collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
