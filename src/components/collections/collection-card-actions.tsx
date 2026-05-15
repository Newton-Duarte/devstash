"use client";

import { Edit3, Ellipsis, Star, Trash2 } from "lucide-react";
import { useState, type FocusEvent } from "react";
import { toast } from "sonner";

import { CollectionDeleteDialog } from "@/components/collections/collection-delete-dialog";
import { CollectionEditDialog } from "@/components/collections/collection-edit-dialog";

interface CollectionCardActionsProps {
  collection: {
    id: string;
    name: string;
    description: string;
  };
}

const menuItemClass =
  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function CollectionCardActions({ collection }: CollectionCardActionsProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const closeOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div className="relative z-20" onBlur={closeOnBlur}>
      <CollectionEditDialog collection={collection} onOpenChange={setEditOpen} open={editOpen} />
      <CollectionDeleteDialog
        collectionId={collection.id}
        collectionName={collection.name}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />

      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Collection actions for ${collection.name}`}
        className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((currentOpen) => !currentOpen);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        type="button"
      >
        <Ellipsis className="size-5" />
      </button>

      {open ? (
        <div
          className="absolute top-11 right-0 z-30 w-44 rounded-2xl border border-white/10 bg-[#111217] p-2 shadow-2xl shadow-black/40"
          onClick={(event) => event.stopPropagation()}
          role="menu"
        >
          <button
            className={menuItemClass}
            onClick={() => {
              setOpen(false);
              setEditOpen(true);
            }}
            type="button"
          >
            <Edit3 className="size-4" />
            Edit
          </button>
          <button
            className={menuItemClass}
            onClick={() => {
              setOpen(false);
              toast.message("Collection favorites are coming soon.");
            }}
            type="button"
          >
            <Star className="size-4" />
            Favorite
          </button>
          <div className="my-2 h-px bg-white/10" />
          <button
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/10 hover:text-red-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => {
              setOpen(false);
              setDeleteOpen(true);
            }}
            type="button"
          >
            <Trash2 className="size-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
