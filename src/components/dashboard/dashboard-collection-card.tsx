"use client";

import {
  Code2,
  File,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Terminal,
} from "lucide-react";
import Link from "next/link";

import { CollectionCardActions } from "@/components/collections/collection-card-actions";
import { FavoriteToggleButton } from "@/components/shared/favorite-toggle-button";
import {
  type DashboardCollection,
  type DashboardCollectionType,
} from "@/lib/db/collections";

const iconMap = {
  Code: Code2,
  Sparkles: MessageSquareQuote,
  Terminal,
  StickyNote: NotebookPen,
  File,
  Image: ImageIcon,
  Link: Link2,
} as const;

function MiniIcon({ type }: { type: DashboardCollectionType }) {
  const Icon = type.icon ? iconMap[type.icon as keyof typeof iconMap] : null;

  if (!Icon) {
    return null;
  }

  return <Icon className="size-4" style={{ color: type.color ?? "#94a3b8" }} />;
}

interface DashboardCollectionCardProps {
  collection: DashboardCollection;
  href?: string;
}

function DashboardCollectionCardContent({
  collection,
  href,
}: {
  collection: DashboardCollection;
  href?: string;
}) {
  return (
    <article
      className="group relative overflow-visible rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-6 transition hover:-translate-y-0.5 before:absolute before:inset-y-0 before:left-0 before:w-[3px]"
      style={{
        boxShadow: `inset 3px 0 0 ${collection.accentColor}`,
      }}
    >
      {href ? (
        <Link
          aria-label={`Open ${collection.name} collection`}
          className="absolute inset-0 z-10 rounded-[1.6rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          href={href}
          prefetch={false}
        />
      ) : null}

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="pointer-events-none relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[1.05rem] font-semibold text-white">
              {collection.name}
            </h3>
            <FavoriteToggleButton
              className="pointer-events-auto inline-flex size-7 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              id={collection.id}
              isFavorite={collection.isFavorite}
              label={`${collection.isFavorite ? "Unfavorite" : "Favorite"} ${collection.name}`}
              resource="collection"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {collection.itemCount} items
          </p>
        </div>

        {href ? <CollectionCardActions collection={collection} /> : null}
      </div>

      <p className="pointer-events-none relative z-10 mb-5 max-w-[28ch] text-sm leading-6 text-muted-foreground">
        {collection.description}
      </p>

      <div className="pointer-events-none relative z-10 flex min-h-4 items-center gap-3">
        {collection.types.map((type) => (
          <MiniIcon key={`${collection.id}-${type.name}`} type={type} />
        ))}
      </div>
    </article>
  );
}

export function DashboardCollectionCard({ collection, href }: DashboardCollectionCardProps) {
  return <DashboardCollectionCardContent collection={collection} href={href} />;
}
