"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/utils";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-[#08090d] text-white",
        className
      )}
      {...props}
    />
  );
}

function CommandDialog({
  children,
  className,
  label = "Command menu",
  overlayClassName,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Dialog>) {
  return (
    <CommandPrimitive.Dialog
      className={cn(
        "fixed inset-x-4 top-8 z-[70] mx-auto max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#08090d] text-white shadow-2xl shadow-black/70 sm:top-[12vh]",
        className
      )}
      overlayClassName={cn("fixed inset-0 z-[69] bg-black/75 backdrop-blur-sm", overlayClassName)}
      label={label}
      {...props}
    >
      <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
      {children}
    </CommandPrimitive.Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <CommandPrimitive.Input
      className={cn(
        "h-14 w-full border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-[420px] overflow-y-auto overflow-x-hidden p-3", className)}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn("px-4 py-10 text-center text-sm text-slate-500", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-slate-200 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-slate-500 [&_[cmdk-group-heading]]:uppercase",
        className
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-1 my-2 h-px bg-white/10", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-3 rounded-2xl px-3 py-3 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
};
