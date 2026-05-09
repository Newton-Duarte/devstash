"use client";

import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface SheetProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Sheet({ children, open, onOpenChange }: SheetProps) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  return <>{children}</>;
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SheetContent({ className, children, open, onOpenChange, ...props }: SheetContentProps) {
  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition pointer-events-none",
        open && "pointer-events-auto"
      )}
    >
      <button
        aria-label="Close drawer"
        className={cn(
          "absolute inset-0 bg-black/70 opacity-0 transition-opacity",
          open && "opacity-100"
        )}
        onClick={() => onOpenChange(false)}
        tabIndex={open ? 0 : -1}
        type="button"
      />
      <div
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 right-0 flex h-full w-full max-w-[560px] translate-x-full flex-col border-l border-white/10 bg-[#08090d] text-white shadow-2xl shadow-black/40 transition-transform duration-300 ease-out",
          open && "translate-x-0",
          className
        )}
        role="dialog"
        tabIndex={-1}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

function SheetCloseButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
      type="button"
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

export { Sheet, SheetCloseButton, SheetContent };
