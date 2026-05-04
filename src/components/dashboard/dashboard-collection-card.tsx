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
}

export function DashboardCollectionCard({ collection }: DashboardCollectionCardProps) {
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

        <button
          aria-label={`More options for ${collection.name}`}
          className="text-muted-foreground transition hover:text-white"
          type="button"
        >
          <Ellipsis className="size-5" />
        </button>
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
