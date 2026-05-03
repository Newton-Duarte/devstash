import { ExternalLink, Star } from "lucide-react";

import { type MockItem, mockItemTypes } from "@/lib/mock-data";

interface DashboardRecentItemProps {
  item: MockItem;
}

const itemTypeById = new Map(mockItemTypes.map((itemType) => [itemType.id, itemType]));

export function DashboardRecentItem({ item }: DashboardRecentItemProps) {
  const itemType = itemTypeById.get(item.itemTypeId);

  return (
    <article className="rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-5">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate text-[1.02rem] font-semibold text-white">
              {item.title}
            </h3>
            {item.isFavorite ? (
              <Star className="size-4 fill-[#facc15] text-[#facc15]" />
            ) : null}
            {item.url ? (
              <ExternalLink className="size-4 text-slate-500" />
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className="rounded-xl border border-border/80 px-3 py-1 text-xs font-medium capitalize"
              style={{
                backgroundColor: `${itemType?.color ?? "#334155"}18`,
                color: itemType?.color ?? "#cbd5e1",
              }}
            >
              {itemType?.name ?? "item"}
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

        <p className="shrink-0 text-sm text-muted-foreground">
          {item.updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </article>
  );
}
