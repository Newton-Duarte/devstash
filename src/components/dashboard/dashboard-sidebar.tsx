import Link from "next/link";
import {
  ChevronDown,
  Code2,
  File,
  Folder,
  FolderKanban,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Settings,
  Star,
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
  .slice(0, 3);

function pluralizeType(type: string) {
  return type.endsWith("s") ? type : `${type}s`;
}

function SidebarLabel({
  children,
  condensed,
}: {
  children: React.ReactNode;
  condensed: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 text-[0.95rem] font-medium text-slate-300",
        condensed && "justify-center px-0"
      )}
    >
      <span className={cn(condensed && "sr-only")}>{children}</span>
      <ChevronDown
        className={cn("size-4 text-muted-foreground", condensed && "hidden")}
      />
    </div>
  );
}

function SidebarCollectionLink({
  collection,
  condensed,
  favorite = false,
}: {
  collection: MockCollection;
  condensed: boolean;
  favorite?: boolean;
}) {
  return (
    <Link
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.04]",
        condensed && "justify-center px-0"
      )}
      href={`/collections/${collection.id}`}
      prefetch={false}
    >
      <Folder className="size-4 shrink-0 text-slate-400" />
      <span className={cn("min-w-0 flex-1 truncate", condensed && "sr-only")}>
        {collection.name}
      </span>
      {favorite ? (
        <Star
          className={cn(
            "size-4 fill-[#facc15] text-[#facc15]",
            condensed && "hidden"
          )}
        />
      ) : null}
      {!favorite ? (
        <span className={cn("text-sm text-muted-foreground", condensed && "hidden")}>
          {collection.itemCount}
        </span>
      ) : null}
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
    <div className="flex h-full flex-col gap-8 text-sm">
      <div className="space-y-4">
        <SidebarLabel condensed={condensed}>Types</SidebarLabel>

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
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[0.95rem] text-slate-100 transition hover:bg-white/[0.04]",
                  condensed && "justify-center px-0"
                )}
                href={href}
                key={itemType.id}
                prefetch={false}
              >
                <Icon
                  className="size-4 shrink-0"
                  style={{ color: itemType.color }}
                />

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
                    "text-base text-muted-foreground",
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

      <div className="space-y-4 border-t border-border pt-6">
        <SidebarLabel condensed={condensed}>Collections</SidebarLabel>

        <div className="space-y-5">
          <div>
            <p
              className={cn(
                "px-4 text-xs tracking-[0.18em] text-muted-foreground uppercase",
                condensed && "sr-only"
              )}
            >
              Favorites
            </p>
            <div className="mt-3 space-y-1">
              {favorites.map((collection) => (
                <SidebarCollectionLink
                  collection={collection}
                  condensed={condensed}
                  favorite
                  key={collection.id}
                />
              ))}
            </div>
          </div>

          <div>
            <p
              className={cn(
                "px-4 text-xs tracking-[0.18em] text-muted-foreground uppercase",
                condensed && "sr-only"
              )}
            >
              All collections
            </p>
            <div className="mt-3 space-y-1">
              {recentCollections.map((collection) => (
                <SidebarCollectionLink
                  collection={collection}
                  condensed={condensed}
                  key={collection.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            condensed && "justify-center px-0"
          )}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-sm font-semibold text-slate-900">
            {mockUser.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className={cn("min-w-0 flex-1", condensed && "sr-only")}>
            <p className="truncate text-[1rem] font-medium text-white">
              {mockUser.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              john@example.com
            </p>
          </div>

          <button
            aria-label="Settings"
            className={cn(
              "text-muted-foreground transition hover:text-white",
              condensed && "hidden"
            )}
            type="button"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
