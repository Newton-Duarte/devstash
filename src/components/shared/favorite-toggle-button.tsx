"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, useTransition } from "react";
import { toast } from "sonner";

import { setCollectionFavorite } from "@/actions/collections";
import { setItemFavorite } from "@/actions/items";
import { type ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface FavoriteToggleButtonProps {
  className?: string;
  iconClassName?: string;
  id: string;
  isFavorite: boolean;
  label?: string;
  onItemUpdated?: (item: ItemDetail) => void;
  resource: "collection" | "item";
  showText?: boolean;
}

export function FavoriteToggleButton({
  className,
  iconClassName,
  id,
  isFavorite,
  label,
  onItemUpdated,
  resource,
  showText = false,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const nextFavorite = !isFavorite;
  const resourceLabel = resource === "collection" ? "collection" : "item";
  const fallbackLabel = `${nextFavorite ? "Favorite" : "Unfavorite"} ${resourceLabel}`;

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (pending) {
      return;
    }

    startTransition(async () => {
      if (resource === "collection") {
        const result = await setCollectionFavorite(id, nextFavorite);

        if (!result.success) {
          toast.error(result.error ?? "Unable to update favorite.");
          return;
        }

        toast.success(`${nextFavorite ? "Added to" : "Removed from"} favorites.`);
        router.refresh();
        return;
      }

      const result = await setItemFavorite(id, nextFavorite);

      if (!result.success) {
        toast.error(result.error ?? "Unable to update favorite.");
        return;
      }

      if (result.data) {
        onItemUpdated?.(result.data);
      }

      toast.success(`${nextFavorite ? "Added to" : "Removed from"} favorites.`);
      router.refresh();
    });
  };

  return (
    <button
      aria-label={label ?? fallbackLabel}
      aria-pressed={isFavorite}
      className={className}
      disabled={pending}
      onClick={toggleFavorite}
      type="button"
    >
      <Star className={cn("size-4", isFavorite && "fill-[#facc15] text-[#facc15]", iconClassName)} />
      {showText ? <span>{isFavorite ? "Unfavorite" : "Favorite"}</span> : null}
    </button>
  );
}
