import {
  Code2,
  File,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  NotebookPen,
  Terminal,
} from "lucide-react";

import { type DashboardItemType } from "@/lib/db/items";

const iconMap = {
  Code: Code2,
  Sparkles: MessageSquareQuote,
  Terminal,
  StickyNote: NotebookPen,
  File,
  Image: ImageIcon,
  Link: Link2,
} as const;

interface DashboardItemTypeIconProps {
  type: DashboardItemType;
  className?: string;
}

export function DashboardItemTypeIcon({
  type,
  className,
}: DashboardItemTypeIconProps) {
  const Icon = type.icon ? iconMap[type.icon as keyof typeof iconMap] : null;

  if (!Icon) {
    return null;
  }

  return <Icon className={className} style={{ color: type.color ?? "#94a3b8" }} />;
}
