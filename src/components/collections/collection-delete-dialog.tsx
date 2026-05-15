"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useTransition } from "react";
import { toast } from "sonner";

import { deleteCollection } from "@/actions/collections";
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

interface CollectionDeleteDialogProps {
  children?: ReactNode;
  collectionId: string;
  collectionName: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  redirectTo?: string;
}

export function CollectionDeleteDialog({
  children,
  collectionId,
  collectionName,
  onOpenChange,
  open,
  redirectTo,
}: CollectionDeleteDialogProps) {
  const router = useRouter();
  const [deleting, startDeleting] = useTransition();

  const confirmDelete = () => {
    if (deleting) {
      return;
    }

    startDeleting(async () => {
      const result = await deleteCollection(collectionId);

      if (!result.success) {
        toast.error(result.error ?? "Unable to delete collection.");
        return;
      }

      toast.success("Collection deleted. Items were kept in your stash.");
      onOpenChange?.(false);

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      router.refresh();
    });
  };

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      {children ? <AlertDialogTrigger asChild>{children}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {collectionName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the collection and its item memberships. The items themselves stay in
            your stash.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white hover:bg-red-400"
            disabled={deleting}
            onClick={confirmDelete}
          >
            {deleting ? "Deleting..." : "Delete collection"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
