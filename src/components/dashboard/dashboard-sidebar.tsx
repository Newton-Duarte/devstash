import Link from "next/link";
import {
  Code2,
  File,
  FolderKanban,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Terminal,
} from "lucide-react";

import {
  type MockCollection,
  mockCollections,
  mockItemTypeCounts,
  mockItemTypes,
  mockUser,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap = {
  Code: Code2,
  Sparkles: MessageSquareQuote,
  Terminal,
  StickyNote: NotebookPen,
  File,
  Image: ImageIcon,
  Link: Link2,
} as const;

const favorites = mockCollections.filter((collection) => collection.isFavorite);
const recentCollections = [...mockCollections]
  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  .slice(0, 4);

function pluralizeType(type: string) {
  return type.endsWith("s") ? type : `${type}s`;
}

function SidebarCollectionLink({
  collection,
  condensed,
}: {
  collection: MockCollection;
  condensed: boolean;
}) {
  return (
    <Link
      className="group flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
      href={`/collections/${collection.id}`}
      prefetch={false}
    >
      <span className={cn("truncate", condensed && "sr-only")}>
        {collection.name}
      </span>
      <span className="text-xs text-muted-foreground/80">
        {collection.itemCount}
      </span>
    </Link>
  );
}

interface DashboardSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
}

export function DashboardSidebar({
  collapsed = false,
  mobile = false,
}: DashboardSidebarProps) {
  const condensed = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="space-y-1">
        <p
          className={cn(
            "px-3 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase",
            condensed && "sr-only"
          )}
        >
          Types
        </p>
        <nav className="space-y-1">
          {mockItemTypes.map((itemType) => {
            const Icon =
              iconMap[itemType.icon as keyof typeof iconMap] ?? FolderKanban;
            const href = `/items/${pluralizeType(itemType.name)}`;
            const count =
              mockItemTypeCounts[
                itemType.name as keyof typeof mockItemTypeCounts
              ] ?? 0;

            return (
              <Link
                className="group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-foreground transition hover:bg-accent"
                href={href}
                key={itemType.id}
                prefetch={false}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border"
                  style={{
                    backgroundColor: `${itemType.color}20`,
                    color: itemType.color,
                  }}
                >
                  <Icon className="size-4" />
                </span>

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate capitalize",
                    condensed && "sr-only"
                  )}
                >
                  {pluralizeType(itemType.name)}
                </span>
                <span
                  className={cn(
                    "text-xs text-muted-foreground",
                    condensed && "sr-only"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-1">
        <p
          className={cn(
            "px-3 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase",
            condensed && "sr-only"
          )}
        >
          Favorites
        </p>
        <div className="space-y-1">
          {favorites.map((collection) => (
            <SidebarCollectionLink
              collection={collection}
              condensed={condensed}
              key={collection.id}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p
          className={cn(
            "px-3 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase",
            condensed && "sr-only"
          )}
        >
          Recent
        </p>
        <div className="space-y-1">
          {recentCollections.map((collection) => (
            <SidebarCollectionLink
              collection={collection}
              condensed={condensed}
              key={collection.id}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-3xl border border-border bg-card/70 p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
            {mockUser.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className={cn("min-w-0", condensed && "sr-only")}>
            <p className="truncate text-sm font-semibold text-foreground">
              {mockUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {mockUser.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
