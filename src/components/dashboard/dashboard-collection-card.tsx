import { Ellipsis, Link2, Sparkles, Star } from "lucide-react";

import { type MockCollection } from "@/lib/mock-data";

const collectionAccents = [
  "before:bg-[#2f81f7]",
  "before:bg-[#2f81f7]",
  "before:bg-[#2f81f7]",
  "before:bg-[#facc15]",
  "before:bg-[#f97316]",
  "before:bg-[#8b5cf6]",
];

const collectionIcons = [
  ["code", "note", "link"],
  ["code", "note"],
  ["file", "note"],
  ["note", "code", "link", "prompt"],
  ["command", "note"],
  ["prompt", "code", "note"],
] as const;

function MiniIcon({ kind }: { kind: (typeof collectionIcons)[number][number] }) {
  if (kind === "link") {
    return <Link2 className="size-4 text-[#10b981]" />;
  }

  if (kind === "prompt") {
    return <Sparkles className="size-4 text-[#8b5cf6]" />;
  }

  return (
    <span
      className={
        kind === "command"
          ? "text-sm text-[#f97316]"
          : kind === "file"
            ? "text-sm text-slate-400"
            : kind === "note"
              ? "text-sm text-[#facc15]"
              : "text-sm text-[#2f81f7]"
      }
    >
      {kind === "command"
        ? ">_"
        : kind === "file"
          ? "[]"
          : kind === "note"
            ? "[]"
            : "<>"}
    </span>
  );
}

interface DashboardCollectionCardProps {
  collection: MockCollection;
  index: number;
}

export function DashboardCollectionCard({
  collection,
  index,
}: DashboardCollectionCardProps) {
  const accentClass = collectionAccents[index] ?? collectionAccents[0];
  const icons = collectionIcons[index] ?? collectionIcons[0];

  return (
    <article
      className={`relative overflow-hidden rounded-[1.6rem] border border-border bg-[#0a0a0c] px-6 py-6 before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${accentClass}`}
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

      <div className="flex items-center gap-3">
        {icons.map((kind, iconIndex) => (
          <MiniIcon key={`${collection.id}-${iconIndex}`} kind={kind} />
        ))}
      </div>
    </article>
  );
}
