import {
  Code2,
  Ellipsis,
  File,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Star,
  Terminal,
} from "lucide-react";
import Link from "next/link";

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

function DashboardCollectionCardContent({ collection }: { collection: DashboardCollection }) {
  return (
    <article
      className="relative overflow-hidden rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px]"
      style={{
        boxShadow: `inset 3px 0 0 ${collection.accentColor}`,
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-[1.05rem] font-semibold text-white">
              {collection.name}
            </h3>
            {collection.isFavorite ? (
              <Star className="size-4 fill-[#facc15] text-[#facc15]" />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {collection.itemCount} items
          </p>
        </div>

        <span aria-hidden="true" className="text-muted-foreground transition group-hover:text-white">
          <Ellipsis className="size-5" />
        </span>
      </div>

      <p className="mb-5 max-w-[28ch] text-sm leading-6 text-muted-foreground">
        {collection.description}
      </p>

      <div className="flex min-h-4 items-center gap-3">
        {collection.types.map((type) => (
          <MiniIcon key={`${collection.id}-${type.name}`} type={type} />
        ))}
      </div>
    </article>
  );
}

export function DashboardCollectionCard({ collection, href }: DashboardCollectionCardProps) {
  if (href) {
    return (
      <Link
        aria-label={`Open ${collection.name} collection`}
        className="group block transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        href={href}
        prefetch={false}
      >
        <DashboardCollectionCardContent collection={collection} />
      </Link>
    );
  }

  return <DashboardCollectionCardContent collection={collection} />;
}
