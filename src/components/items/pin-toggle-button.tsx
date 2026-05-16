"use client";

import { Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEvent, useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { toggleItemPin } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { type ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface PinToggleButtonProps {
  item: ItemDetail;
  onItemUpdated: (item: ItemDetail) => void;
}

export function PinToggleButton({ item, onItemUpdated }: PinToggleButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticPinned, setOptimisticPinned] = useOptimistic(item.isPinned);
  const nextPinned = !optimisticPinned;

  const togglePinned = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (pending) {
      return;
    }

    startTransition(async () => {
      setOptimisticPinned(nextPinned);

      const result = await toggleItemPin(item.id, nextPinned);

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Unable to update pin.");
        return;
      }

      onItemUpdated(result.data);
      toast.success(`${nextPinned ? "Pinned" : "Unpinned"} item.`);
      router.refresh();
    });
  };

  return (
    <Button
      aria-label={`${nextPinned ? "Pin" : "Unpin"} item`}
      aria-pressed={optimisticPinned}
      className={cn(
        "size-10 rounded-full border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white",
        optimisticPinned && "text-[#facc15] hover:text-[#facc15]"
      )}
      disabled={pending}
      onClick={togglePinned}
      size="icon"
      type="button"
      variant="outline"
    >
      <Pin className={cn("size-4", optimisticPinned && "fill-[#facc15] text-[#facc15]")} />
    </Button>
  );
}
