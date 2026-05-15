"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateCollection } from "@/actions/collections";
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

interface CollectionEditDialogProps {
  children?: ReactNode;
  collection: {
    id: string;
    name: string;
    description: string;
  };
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

interface CollectionEditValues {
  name: string;
  description: string;
}

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

export function CollectionEditDialog({
  children,
  collection,
  onOpenChange,
  open: controlledOpen,
}: CollectionEditDialogProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [values, setValues] = useState<CollectionEditValues>({
    name: collection.name,
    description: collection.description === "No description yet" ? "" : collection.description,
  });
  const [updating, startUpdating] = useTransition();
  const open = controlledOpen ?? uncontrolledOpen;

  const updateField = (field: keyof CollectionEditValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const updateOpen = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (nextOpen) {
      setValues({
        name: collection.name,
        description: collection.description === "No description yet" ? "" : collection.description,
      });
    }
  };

  const submitCollection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (updating || !values.name.trim()) {
      return;
    }

    startUpdating(async () => {
      const result = await updateCollection(collection.id, {
        name: values.name,
        description: toNullableString(values.description),
      });

      if (!result.success) {
        toast.error(result.error ?? "Unable to update collection.");
        return;
      }

      updateOpen(false);
      toast.success("Collection updated.");
      router.refresh();
    });
  };

  return (
    <Dialog onOpenChange={updateOpen} open={open}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-w-xl">
        <DialogHeader className="pr-10">
          <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
            Edit collection
          </p>
          <DialogTitle>Update metadata</DialogTitle>
          <DialogDescription>
            Rename this collection or adjust the description shown across DevStash.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={submitCollection}>
          <div className="grid gap-4">
            <label className="block space-y-2">
              <FieldLabel>Name</FieldLabel>
              <Input
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600"
                onChange={(event) => updateField("name", event.target.value)}
                required
                value={values.name}
              />
            </label>

            <label className="block space-y-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                className="min-h-28 w-full rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white shadow-xs outline-none transition-colors placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(event) => updateField("description", event.target.value)}
                value={values.description}
              />
            </label>
          </div>

          <DialogFooter>
            <Button
              className="rounded-2xl border-white/10 bg-transparent text-slate-100 hover:bg-white/[0.04]"
              disabled={updating}
              onClick={() => updateOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-2xl bg-white px-5 text-slate-900 hover:bg-slate-200"
              disabled={updating || !values.name.trim()}
              type="submit"
            >
              {updating ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
