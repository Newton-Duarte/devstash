import { ExternalLink, Pin, Star } from "lucide-react";
import { type KeyboardEvent } from "react";

import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import { type ItemListItem } from "@/lib/db/item-list";

interface ItemCardProps {
  item: ItemListItem;
  onOpen?: (itemId: string) => void;
}

export function ItemCard({ item, onOpen }: ItemCardProps) {
  const openLabel = `Open details for ${item.title}`;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onOpen) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(item.id);
    }
  };

  return (
    <article
      aria-label={onOpen ? openLabel : undefined}
      className="relative overflow-hidden rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-5 transition hover:border-white/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={onOpen ? () => onOpen(item.id) : undefined}
      onKeyDown={onKeyDown}
      role={onOpen ? "button" : undefined}
      style={{ boxShadow: `inset 3px 0 0 ${item.type.color ?? "#334155"}` }}
      tabIndex={onOpen ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
            <div
              className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${item.type.color ?? "#334155"}1f` }}
            >
              <DashboardItemTypeIcon className="size-5" type={item.type} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="truncate text-[1.02rem] font-semibold text-white">{item.title}</h2>
                {item.isPinned ? <Pin className="size-4 text-muted-foreground" /> : null}
                {item.isFavorite ? <Star className="size-4 fill-[#facc15] text-[#facc15]" /> : null}
                {item.url ? <ExternalLink className="size-4 text-slate-500" /> : null}
              </div>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          </div>
        </div>

        <p className="shrink-0 text-sm text-muted-foreground">{item.updatedAtLabel}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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
    </article>
  );
}
