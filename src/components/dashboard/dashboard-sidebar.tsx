import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Folder,
  LogOut,
  Star,
} from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { DashboardItemTypeIcon } from "@/components/dashboard/dashboard-item-type-icon";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  type DashboardSidebarCollection,
  type DashboardSidebarData,
} from "@/lib/db/sidebar";
import { cn } from "@/lib/utils";

function pluralizeType(type: string) {
  return type.endsWith("s") ? type : `${type}s`;
}

function isProType(type: string) {
  return type === "file" || type === "image";
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
  collection: DashboardSidebarCollection;
  condensed: boolean;
  favorite?: boolean;
}) {
  return (
    <Link
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.04]",
        condensed && "justify-center px-0"
      )}
      href={collection.href}
      prefetch={false}
    >
      {favorite ? (
        <Folder className="size-4 shrink-0 text-slate-400" />
      ) : (
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: collection.accentColor }}
        />
      )}
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

function getUserDisplayName(user: DashboardSidebarData["user"]) {
  if (!user) {
    return "Account";
  }

  return user.name?.trim() || user.email;
}

interface DashboardSidebarProps {
  data: DashboardSidebarData;
  collapsed?: boolean;
  mobile?: boolean;
}

export function DashboardSidebar({
  data,
  collapsed = false,
  mobile = false,
}: DashboardSidebarProps) {
  const condensed = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col gap-8 text-sm">
      <div className="space-y-4">
        <SidebarLabel condensed={condensed}>Types</SidebarLabel>

        <nav className="space-y-1">
          {data.itemTypes.map((itemType) => {
            return (
              <Link
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[0.95rem] text-slate-100 transition hover:bg-white/[0.04]",
                  condensed && "justify-center px-0"
                )}
                href={itemType.href}
                key={itemType.id}
                prefetch={false}
              >
                <DashboardItemTypeIcon className="size-4 shrink-0" type={itemType} />

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate capitalize",
                    condensed && "sr-only"
                  )}
                >
                  {pluralizeType(itemType.name)}
                </span>
                {isProType(itemType.name) ? (
                  <Badge
                    className={cn(
                      "border-white/10 bg-white/[0.06] px-1.5 py-0 text-[0.6rem] font-semibold text-slate-300",
                      condensed && "hidden"
                    )}
                    variant="secondary"
                  >
                    PRO
                  </Badge>
                ) : null}
                <span
                  className={cn(
                    "text-base text-muted-foreground",
                    condensed && "sr-only"
                  )}
                >
                  {itemType.count}
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
              {data.favoriteCollections.map((collection) => (
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
              {data.recentCollections.map((collection) => (
                <SidebarCollectionLink
                  collection={collection}
                  condensed={condensed}
                  key={collection.id}
                />
              ))}
            </div>
            <Link
              className={cn(
                "mt-4 inline-flex px-4 text-sm text-slate-400 transition hover:text-white",
                condensed && "sr-only"
              )}
              href={data.viewAllCollectionsHref}
              prefetch={false}
            >
              View all collections
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        {data.user ? (
          <details className="relative">
            <summary
              aria-label="Open account menu"
              className={cn(
                "flex list-none items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                condensed && "justify-center px-0"
              )}
            >
              <UserAvatar
                email={data.user.email}
                image={data.user.image}
                name={data.user.name}
                size="md"
              />

              <div className={cn("min-w-0 flex-1", condensed && "sr-only")}>
                <p className="truncate text-[1rem] font-medium text-white">
                  {getUserDisplayName(data.user)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {data.user.email}
                </p>
              </div>

              <span
                className={cn(
                  "text-muted-foreground transition hover:text-white",
                  condensed && "hidden"
                )}
              >
                <ChevronUp className="size-4" />
              </span>
            </summary>

            <div className="absolute bottom-full right-0 z-10 mb-3 w-44 rounded-2xl border border-border/80 bg-[#111216] p-2 shadow-2xl shadow-black/30">
                <Link
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-white/[0.05]"
                  href="/profile"
                  prefetch={false}
                >
                  Profile
                </Link>
                <form action={signOutAction}>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.05]"
                    type="submit"
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </button>
                </form>
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
