"use client";

import Image from "next/image";
import { ImageIcon, Pin } from "lucide-react";

import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button";
import { type ItemListItem } from "@/lib/db/item-list";

interface ImageThumbnailCardProps {
  item: ItemListItem;
  onOpen: (itemId: string) => void;
}

export function ImageThumbnailCard({ item, onOpen }: ImageThumbnailCardProps) {
  const thumbnailUrl = `/api/items/${item.id}/download`;

  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-border bg-[#0a0a0c] text-left shadow-2xl shadow-black/10 transition hover:border-white/20">
      <button
        aria-label={`Open details for ${item.title}`}
        className="absolute inset-0 z-0 rounded-[1.6rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => onOpen(item.id)}
        type="button"
      />
      <div className="pointer-events-none relative z-10 aspect-video overflow-hidden bg-white/[0.03]">
        {item.fileName ? (
          <Image
            alt={item.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={thumbnailUrl}
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-600">
            <ImageIcon className="size-8" />
          </div>
        )}
      </div>

      <div className="pointer-events-none relative z-10 space-y-3 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[1.02rem] font-semibold text-white">{item.title}</h2>
              {item.isPinned ? <Pin className="size-4 shrink-0 text-muted-foreground" /> : null}
              <FavoriteToggleButton
                className="pointer-events-auto inline-flex size-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                id={item.id}
                isFavorite={item.isFavorite}
                label={`${item.isFavorite ? "Unfavorite" : "Favorite"} ${item.title}`}
                resource="item"
              />
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {item.description}
            </p>
          </div>

          <p className="shrink-0 text-sm text-muted-foreground">{item.updatedAtLabel}</p>
        </div>

        {item.tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {item.tags.map((tag) => (
              <span
                className="rounded-xl border border-border bg-[#16161b] px-3 py-1 text-xs font-medium text-slate-300"
                key={`${item.id}-${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
