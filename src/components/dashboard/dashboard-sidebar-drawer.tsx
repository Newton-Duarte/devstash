import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function DashboardSidebarDrawer({
  open,
  onClose,
  children,
}: DashboardSidebarDrawerProps) {
  return (
    <>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[288px] max-w-[85vw] flex-col border-r border-border bg-background px-4 py-5 shadow-2xl transition-transform duration-300 lg:hidden",
          open
            ? "pointer-events-auto translate-x-0"
            : "pointer-events-none -translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            DevStash
          </p>

          <Button
            aria-label="Close sidebar"
            onClick={onClose}
            size="icon"
            type="button"
            variant="outline"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
