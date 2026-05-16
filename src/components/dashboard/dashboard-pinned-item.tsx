"use client";

import { Pin } from "lucide-react";

import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button";
import { type DashboardItem } from "@/lib/db/items";

interface DashboardPinnedItemProps {
  item: DashboardItem;
  onOpen?: (itemId: string) => void;
}

export function DashboardPinnedItem({ item, onOpen }: DashboardPinnedItemProps) {
  return (
    <article
      className="relative overflow-hidden rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-6 transition before:absolute before:inset-y-0 before:left-0 before:w-[3px] hover:border-white/20"
      style={{ boxShadow: `inset 3px 0 0 ${item.type.color ?? "#334155"}` }}
    >
      {onOpen ? (
        <button
          aria-label={`Open details for ${item.title}`}
          className="absolute inset-0 z-0 rounded-[1.6rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => onOpen(item.id)}
          type="button"
        />
      ) : null}
      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start gap-4">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${item.type.color ?? "#334155"}1f`,
              }}
            >
              <DashboardItemTypeIcon className="size-6" type={item.type} />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h3 className="text-[1.05rem] font-semibold text-white">
                  {item.title}
                </h3>
                {item.isPinned ? (
                  <Pin className="size-4 text-muted-foreground" />
                ) : null}
                <FavoriteToggleButton
                  className="pointer-events-auto inline-flex size-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                  id={item.id}
                  isFavorite={item.isFavorite}
                  label={`${item.isFavorite ? "Unfavorite" : "Favorite"} ${item.title}`}
                  resource="item"
                />
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-xl border border-border/80 px-3 py-1 text-xs font-medium capitalize"
                  style={{
                    backgroundColor: `${item.type.color ?? "#334155"}18`,
                    color: item.type.color ?? "#cbd5e1",
                  }}
                >
                  {item.type.name}
                </span>

                {item.tags.map((tag) => (
                  <span
                    className="rounded-xl border border-border bg-[#16161b] px-3 py-1 text-xs font-medium text-slate-300"
                    key={`${item.id}-${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">
          {item.updatedAtLabel}
        </p>
      </div>
    </article>
  );
}
